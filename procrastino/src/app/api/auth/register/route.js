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
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
        });

        const token = await setAuthCookie(user._id.toString());

        return NextResponse.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                xp: user.xp,
                currentStreak: user.currentStreak,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        const message = error.message.includes('MONGODB_URI') ? 'Database configuration missing: Set MONGODB_URI in .env.local' : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
