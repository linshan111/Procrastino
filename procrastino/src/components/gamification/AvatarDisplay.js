'use client';

import { AVATAR_LEVELS } from '@/lib/constants';

export default function AvatarDisplay({ xp, size = 'large' }) {
    const currentLevel = AVATAR_LEVELS.reduce((acc, level) => (xp >= level.minXP ? level : acc), AVATAR_LEVELS[0]);
    const isLarge = size === 'large';

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Avatar Container */}
            <div style={{
                width: isLarge ? '120px' : '60px',
                height: isLarge ? '120px' : '60px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentLevel.level >= 4 ? '#f9ca24, #f0932b' : currentLevel.level >= 3 ? '#6c5ce7, #a855f7' : currentLevel.level >= 2 ? '#00d2a0, #00b894' : '#636e72, #2d3436'})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: isLarge ? '3rem' : '1.5rem',
                boxShadow: currentLevel.level >= 3 ? '0 0 30px var(--color-accent-glow)' : 'none',
            }}>
                {currentLevel.emoji}
            </div>

            {isLarge && (
                <>
                    <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                        {currentLevel.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Level {currentLevel.level}
                    </p>

                    {/* Evolution Path */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        flexWrap: 'wrap',
                    }}>
                        {AVATAR_LEVELS.map((level) => (
                            <div key={level.level} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                background: xp >= level.minXP ? 'rgba(108, 92, 231, 0.2)' : 'var(--color-bg-input)',
                                color: xp >= level.minXP ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                border: `1px solid ${xp >= level.minXP ? 'var(--color-accent)' : 'var(--color-border)'}40`,
                            }}>
                                {level.emoji} {level.name}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
