import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAvatarLevel } from '@/lib/constants';

const FAKE_ADJECTIVES = ['Quantum', 'Neon', 'Cyber', 'Swift', 'Silent', 'Cosmic', 'Hyper', 'Alpha', 'Beta', 'Omega'];
const FAKE_NOUNS = ['Coder', 'Scholar', 'Ninja', 'Master', 'Brain', 'Machine', 'Spirit', 'Ghost', 'Force', 'Mind'];

function generateFakeUsers() {
    const users = [];
    // Set base time precisely to this exact moment (Feb 22, 2026, approx 20:11 IST)
    const baseDate = new Date('2026-02-22T20:11:00+05:30').getTime();

    // We don't floor this anymore. This gives fractional days, so they will 
    // literally slowly gain points minute-by-minute from 0 as time passes.
    const daysSince = Math.max(0, (Date.now() - baseDate) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < 100; i++) {
        const seededRandom = ((i * 9301 + 49297) % 233280) / 233280;

        const adj = FAKE_ADJECTIVES[i % FAKE_ADJECTIVES.length];
        const noun = FAKE_NOUNS[Math.floor(i / FAKE_ADJECTIVES.length) % FAKE_NOUNS.length];
        const num = Math.floor(seededRandom * 99);
        const name = `${adj}${noun}${num}`;

        users.push({
            name,
            // They start at precisely 0. They will slowly gain up to ~200 XP/day
            xp: Math.floor(seededRandom * 200 * daysSince),
            // Streaks grow by 1 exactly every 24 hours
            currentStreak: Math.floor(daysSince),
            // They gain up to ~120 focus minutes per day
            totalFocusMinutes: Math.floor(seededRandom * 120 * daysSince),
        });
    }
    return users;
}

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'focus';
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = parseInt(searchParams.get('offset') || '0');

        const sortField = type === 'streak' ? 'currentStreak' : 'totalFocusMinutes';

        // Fetch all viable real users directly from database 
        const realUsers = await User.find({ [sortField]: { $gt: 0 } })
            .select('name xp currentStreak totalFocusMinutes');

        // Merge real and fake users
        const allUsers = [...realUsers, ...generateFakeUsers()];

        // Sort in memory
        const sortedUsers = allUsers.sort((a, b) => b[sortField] - a[sortField]);

        // Paginate manually
        const paginatedUsers = sortedUsers.slice(offset, offset + limit);

        const leaderboard = paginatedUsers.map((user, index) => ({
            rank: offset + index + 1,
            name: user.name,
            xp: user.xp,
            currentStreak: user.currentStreak,
            totalFocusMinutes: user.totalFocusMinutes,
            avatarLevel: getAvatarLevel(user.xp),
        }));

        return NextResponse.json({
            users: leaderboard,
            total: sortedUsers.length,
            offset,
            limit,
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
