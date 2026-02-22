import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FocusSession from '@/models/FocusSession';
import { getAuthUser, checkOrigin } from '@/lib/auth';
import { getInsights } from '@/lib/gemini';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const sessions = await FocusSession.find({ userId: auth.userId })
            .sort({ startedAt: -1 })
            .limit(30)
            .populate('taskId', 'title category');

        if (sessions.length < 3) {
            return NextResponse.json({
                fallback: true,
                message: 'Complete at least 3 focus sessions to get AI insights.',
                insights: [],
            });
        }

        const focusHistory = sessions.map((s) => ({
            task: s.taskId?.title || 'Unknown',
            category: s.taskId?.category || 'general',
            date: s.startedAt,
            dayOfWeek: new Date(s.startedAt).toLocaleDateString('en', { weekday: 'long' }),
            hour: new Date(s.startedAt).getHours(),
            plannedMinutes: s.plannedDuration,
            actualMinutes: Math.floor(s.actualFocusTime / 60),
            tabSwitches: s.tabSwitches,
            completed: s.status === 'completed',
        }));

        const result = await getInsights(focusHistory);

        if (!result) {
            return NextResponse.json({
                fallback: true,
                message: 'AI insights temporarily unavailable. Keep focusing!',
                insights: [],
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('AI insights error:', error);
        return NextResponse.json({
            fallback: true,
            message: 'AI insights temporarily unavailable. Keep focusing!',
            insights: [],
        });
    }
}
