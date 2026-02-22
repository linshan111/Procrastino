'use client';

export default function FocusTimer({ remaining, progress, isRunning, tabSwitches }) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Timer Ring */}
            <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '1.5rem' }}>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        className="timer-ring-bg"
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        strokeWidth="8"
                    />
                    <circle
                        className="timer-ring-progress"
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                        color: isRunning ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                    <span style={{
                        fontSize: '0.7rem',
                        color: isRunning ? 'var(--color-success)' : 'var(--color-warning)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        {isRunning ? '● Focused' : '⏸ Paused'}
                    </span>
                </div>
            </div>

            {/* Tab Switch Counter */}
            {tabSwitches > 0 && (
                <div className="animate-shake" style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: tabSwitches > 5 ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255, 165, 2, 0.15)',
                    border: `1px solid ${tabSwitches > 5 ? 'var(--color-danger)' : 'var(--color-warning)'}40`,
                    fontSize: '0.8rem',
                    color: tabSwitches > 5 ? 'var(--color-danger)' : 'var(--color-warning)',
                    fontWeight: 600,
                }}>
                    ⚠️ Tab switches: {tabSwitches} {tabSwitches > 5 ? '(XP penalty active!)' : ''}
                </div>
            )}
        </div>
    );
}
