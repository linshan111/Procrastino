'use client';

import { AVATAR_LEVELS } from '@/lib/constants';

export default function XPBar({ xp }) {
    const currentLevel = AVATAR_LEVELS.reduce((acc, level) => (xp >= level.minXP ? level : acc), AVATAR_LEVELS[0]);
    const currentIdx = AVATAR_LEVELS.findIndex((l) => l.level === currentLevel.level);
    const nextLevel = currentIdx < AVATAR_LEVELS.length - 1 ? AVATAR_LEVELS[currentIdx + 1] : null;

    const progress = nextLevel
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-xp-gold)', fontWeight: 600 }}>
                    ⭐ {xp} XP
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    {nextLevel ? `${nextLevel.minXP - xp} XP to ${nextLevel.name}` : 'MAX LEVEL'}
                </span>
            </div>
            <div className="xp-bar-bg" style={{ height: '10px' }}>
                <div className="xp-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
        </div>
    );
}
