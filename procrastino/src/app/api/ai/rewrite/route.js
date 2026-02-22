import { NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/auth';
import { rewriteTask } from '@/lib/gemini';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { taskTitle, taskDescription } = await request.json();

        if (!taskTitle) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        }

        const result = await rewriteTask(taskTitle, taskDescription);

        if (!result) {
            return NextResponse.json({
                fallback: true,
                microTasks: [{ text: taskTitle, estimatedMinutes: 5 }],
                message: 'AI unavailable — try again later.',
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('AI rewrite error:', error);
        return NextResponse.json({
            fallback: true,
            microTasks: [{ text: request.body?.taskTitle || 'Complete task', estimatedMinutes: 5 }],
            message: 'AI unavailable — try again later.',
        });
    }
}
