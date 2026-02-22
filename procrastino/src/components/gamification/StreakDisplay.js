'use client';

export default function StreakDisplay({ streak, longestStreak }) {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <div className={streak > 0 ? 'animate-fire' : ''} style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {streak > 0 ? '🔥' : '❄️'}
            </div>
            <h3 style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: streak > 0 ? 'var(--color-streak-fire)' : 'var(--color-text-muted)',
            }}>
                {streak}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                {streak > 0 ? 'Day Streak' : 'No Active Streak'}
            </p>
            {longestStreak > 0 && (
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    🏆 Best: {longestStreak} days
                </p>
            )}
        </div>
    );
}
