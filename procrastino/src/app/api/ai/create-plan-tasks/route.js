import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { checkOrigin, getAuthUser } from '@/lib/auth';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const decoded = await getAuthUser(request);
        const userId = decoded?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tasks } = await request.json();

        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json({ error: 'Tasks array is required' }, { status: 400 });
        }

        await connectDB();

        const tasksToCreate = tasks.map(task => ({
            userId,
            title: task.title,
            description: task.description || '',
            focusDuration: task.focusDuration || 25,
            microTasks: task.microTasks || [],
            category: 'Study Plan',
            status: 'pending',
        }));

        const createdTasks = await Task.insertMany(tasksToCreate);

        return NextResponse.json({
            created: createdTasks.length,
            tasks: createdTasks
        }, { status: 201 });

    } catch (error) {
        console.error('Bulk task creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
