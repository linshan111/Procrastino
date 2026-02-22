import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/megallm';
import { checkOrigin } from '@/lib/auth';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        const currentDate = new Date().toISOString().split('T')[0];

        try {
            const replyContent = await generateStudyPlan(messages, currentDate);
            return NextResponse.json({ reply: replyContent });
        } catch (aiError) {
            console.error('AI generation error:', aiError);
            return NextResponse.json({
                error: 'AI planner temporarily unavailable',
                details: aiError.message
            }, { status: 503 });
        }

    } catch (error) {
        console.error('Study plan API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
