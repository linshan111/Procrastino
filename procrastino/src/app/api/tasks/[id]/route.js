import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { getAuthUser, checkOrigin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { id } = await params;
        const updates = await request.json();

        await connectDB();

        const task = await Task.findOne({ _id: id, userId: auth.userId });
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Toggle micro-task completion
        if (updates.toggleMicroTask !== undefined) {
            const microTask = task.microTasks.id(updates.toggleMicroTask);
            if (microTask) {
                microTask.completed = !microTask.completed;
            }
        }

        // Update other fields
        if (updates.title) task.title = updates.title;
        if (updates.description !== undefined) task.description = updates.description;
        if (updates.status) {
            task.status = updates.status;
            if (updates.status === 'completed') {
                task.completedAt = new Date();
            }
        }

        await task.save();

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        const task = await Task.findOne({ _id: id, userId: auth.userId });
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.status !== 'pending') {
            return NextResponse.json({ error: 'Can only delete pending tasks' }, { status: 400 });
        }

        await Task.deleteOne({ _id: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
