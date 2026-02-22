import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, clearAuthCookie } from '@/lib/auth';
import { getAvatarLevel } from '@/lib/constants';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(auth.userId).select('-passwordHash');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const avatarLevel = getAvatarLevel(user.xp);

        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                xp: user.xp,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                totalFocusMinutes: user.totalFocusMinutes,
                avatarLevel: avatarLevel,
                punishmentPrefs: user.punishmentPrefs,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE() {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
}
