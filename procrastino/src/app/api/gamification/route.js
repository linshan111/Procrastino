import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { getAvatarLevel, getNextLevel } from '@/lib/constants';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(auth.userId).select('xp currentStreak longestStreak totalFocusMinutes lastActiveDate');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentLevel = getAvatarLevel(user.xp);
        const nextLevel = getNextLevel(user.xp);

        return NextResponse.json({
            xp: user.xp,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalFocusMinutes: user.totalFocusMinutes,
            avatarLevel: currentLevel,
            nextLevel: nextLevel,
            xpToNextLevel: nextLevel ? nextLevel.minXP - user.xp : 0,
        });
    } catch (error) {
        console.error('Gamification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
