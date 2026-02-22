import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { getAuthUser, checkOrigin } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = { userId: auth.userId };
        if (status) query.status = status;

        const tasks = await Task.find(query).sort({ createdAt: -1 }).limit(50);

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
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

        const { title, description, focusDuration, microTasks, category } = await request.json();

        if (!title || !focusDuration) {
            return NextResponse.json({ error: 'Title and focus duration are required' }, { status: 400 });
        }

        if (focusDuration < 1 || focusDuration > 480) {
            return NextResponse.json({ error: 'Focus duration must be between 1 and 480 minutes' }, { status: 400 });
        }

        await connectDB();

        const task = await Task.create({
            userId: auth.userId,
            title,
            description: description || '',
            focusDuration,
            microTasks: (microTasks || []).map((t) => ({ text: typeof t === 'string' ? t : t.text, completed: false })),
            category: category || 'general',
        });

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error('Create task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
