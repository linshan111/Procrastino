import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FocusSession from '@/models/FocusSession';
import Task from '@/models/Task';
import User from '@/models/User';
import { getAuthUser, checkOrigin } from '@/lib/auth';
import { XP_RULES, TAB_SWITCH_THRESHOLD, SESSION_TIMEOUT_MINUTES } from '@/lib/constants';

function getTodayUTC() {
    return new Date().toISOString().split('T')[0];
}

function updateStreak(user) {
    const today = getTodayUTC();
    const lastActive = user.lastActiveDate;

    if (lastActive === today) return; // already counted today

    if (lastActive) {
        const lastDate = new Date(lastActive + 'T00:00:00Z');
        const todayDate = new Date(today + 'T00:00:00Z');
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.currentStreak += 1;
        } else {
            user.currentStreak = 1;
        }
    } else {
        user.currentStreak = 1;
    }

    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastActiveDate = today;
}

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const active = searchParams.get('active');

        if (active === 'true') {
            // Check for stale sessions (>30 min no update)
            const staleThreshold = new Date(Date.now() - SESSION_TIMEOUT_MINUTES * 60 * 1000);

            const session = await FocusSession.findOne({
                userId: auth.userId,
                status: 'active',
                startedAt: { $gte: staleThreshold },
            }).populate('taskId', 'title focusDuration');

            if (!session) {
                // Abandon any stale active sessions
                await FocusSession.updateMany(
                    { userId: auth.userId, status: 'active' },
                    { status: 'abandoned', endedAt: new Date() }
                );
                return NextResponse.json({ session: null });
            }

            return NextResponse.json({ session });
        }

        // Return recent sessions
        const sessions = await FocusSession.find({ userId: auth.userId })
            .sort({ startedAt: -1 })
            .limit(20)
            .populate('taskId', 'title');

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Get focus error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { taskId } = await request.json();
        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        await connectDB();

        // Auto-abandon any existing active session
        await FocusSession.updateMany(
            { userId: auth.userId, status: 'active' },
            { status: 'abandoned', endedAt: new Date() }
        );

        const task = await Task.findOne({ _id: taskId, userId: auth.userId });
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Mark task as active
        task.status = 'active';
        await task.save();

        const session = await FocusSession.create({
            userId: auth.userId,
            taskId: task._id,
            plannedDuration: task.focusDuration,
        });

        return NextResponse.json({ session }, { status: 201 });
    } catch (error) {
        console.error('Start focus error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { sessionId, action, tabSwitches, actualFocusTime } = await request.json();

        if (!sessionId || !action) {
            return NextResponse.json({ error: 'Session ID and action are required' }, { status: 400 });
        }

        await connectDB();

        const session = await FocusSession.findOne({ _id: sessionId, userId: auth.userId });
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Update focus time and tab switches
        if (actualFocusTime !== undefined) session.actualFocusTime = actualFocusTime;
        if (tabSwitches !== undefined) session.tabSwitches = tabSwitches;

        if (action === 'update') {
            await session.save();
            return NextResponse.json({ session });
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (action === 'complete') {
            session.status = 'completed';
            session.endedAt = new Date();

            // Calculate XP
            const focusMinutes = Math.floor(session.actualFocusTime / 60);
            let xpGained = focusMinutes * XP_RULES.PER_FOCUS_MINUTE;
            xpGained += XP_RULES.COMPLETE_TASK;

            // Check excessive tab switches penalty
            if (session.tabSwitches > TAB_SWITCH_THRESHOLD) {
                xpGained += XP_RULES.EXCESSIVE_TAB_SWITCHES;
            }

            session.xpEarned = Math.max(0, xpGained);
            user.xp = Math.max(0, user.xp + xpGained);
            user.totalFocusMinutes += focusMinutes;

            // Update streak if ≥5 minutes focus
            if (focusMinutes >= 5) {
                updateStreak(user);
            }

            // Mark task as completed
            const task = await Task.findById(session.taskId);
            if (task) {
                task.status = 'completed';
                task.completedAt = new Date();
                task.xpEarned = session.xpEarned;

                // Check if all micro-tasks completed for bonus
                if (task.microTasks.length > 0 && task.microTasks.every((mt) => mt.completed)) {
                    user.xp += XP_RULES.COMPLETE_ALL_MICROTASKS;
                    session.xpEarned += XP_RULES.COMPLETE_ALL_MICROTASKS;
                }
                await task.save();
            }

            await user.save();
            await session.save();

            return NextResponse.json({ session, xpGained: session.xpEarned, user: { xp: user.xp, currentStreak: user.currentStreak } });
        }

        if (action === 'abandon') {
            session.status = 'abandoned';
            session.endedAt = new Date();

            // Deduct XP
            const penalty = XP_RULES.ABANDON_SESSION;
            user.xp = Math.max(0, user.xp + penalty);
            session.xpEarned = penalty;

            // Mark task back to pending
            await Task.findByIdAndUpdate(session.taskId, { status: 'pending' });

            await user.save();
            await session.save();

            return NextResponse.json({ session, xpLost: Math.abs(penalty), user: { xp: user.xp, currentStreak: user.currentStreak } });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Update focus error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
