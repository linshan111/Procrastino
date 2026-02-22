'use client';

export default function StatsOverview({ user }) {
    if (!user) return null;

    const stats = [
        {
            label: 'Current Streak',
            value: user.currentStreak || 0,
            suffix: ' days',
            icon: '🔥',
            color: 'var(--color-streak-fire)',
        },
        {
            label: 'Total XP',
            value: user.xp || 0,
            suffix: ' XP',
            icon: '⭐',
            color: 'var(--color-xp-gold)',
        },
        {
            label: 'Focus Time',
            value: user.totalFocusMinutes || 0,
            suffix: ' min',
            icon: '⏱️',
            color: 'var(--color-success)',
        },
        {
            label: 'Level',
            value: user.avatarLevel?.name || 'Lazy',
            suffix: '',
            icon: user.avatarLevel?.emoji || '🦥',
            color: 'var(--color-accent)',
        },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
        }}>
            {stats.map((stat, i) => (
                <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>
                                {stat.value}{stat.suffix}
                            </p>
                        </div>
                        <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
