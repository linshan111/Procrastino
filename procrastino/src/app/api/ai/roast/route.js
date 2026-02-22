import { NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/auth';
import { generateRoast } from '@/lib/gemini';
import { FALLBACK_ROASTS } from '@/lib/constants';

export async function POST(request) {
    if (!checkOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { context } = await request.json();

        const roast = await generateRoast(context || 'abandon');

        if (!roast) {
            const fallback = FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)];
            return NextResponse.json({ roast: fallback, fallback: true });
        }

        return NextResponse.json({ roast });
    } catch (error) {
        console.error('AI roast error:', error);
        const fallback = FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)];
        return NextResponse.json({ roast: fallback, fallback: true });
    }
}
