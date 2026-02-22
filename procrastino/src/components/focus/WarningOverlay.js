'use client';

export default function WarningOverlay({ message, tabSwitches, onDismiss }) {
    if (!message) return null;

    return (
        <div className="focus-warning-overlay animate-warning-bg">
            <div className="animate-shake" style={{
                textAlign: 'center',
                maxWidth: '400px',
                padding: '2rem',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {tabSwitches > 5 ? '💀' : tabSwitches > 3 ? '😤' : '👀'}
                </div>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    color: 'var(--color-danger)',
                }}>
                    {message}
                </h2>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '1.5rem',
                }}>
                    Tab switches: {tabSwitches} | {tabSwitches > 5 ? 'XP penalty active!' : `${5 - tabSwitches} left before penalty`}
                </p>
                <button onClick={onDismiss} className="btn-primary" style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                }}>
                    🎯 Get Back to Work
                </button>
            </div>
        </div>
    );
}
