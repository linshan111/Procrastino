import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { setAuthCookie, checkOrigin } from '@/lib/auth';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const token = await setAuthCookie(user._id.toString());

        return NextResponse.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                xp: user.xp,
                currentStreak: user.currentStreak,
                totalFocusMinutes: user.totalFocusMinutes,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        const message = error.message.includes('MONGODB_URI') ? 'Database configuration missing: Set MONGODB_URI in .env.local' : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
