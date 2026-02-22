'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';

export default function LeaderboardPage() {
    const { user, loading } = useAuth();
    const [type, setType] = useState('focus');
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoadingData(true);
            try {
                const res = await fetch(`/api/leaderboard?type=${type}&limit=${limit}&offset=${offset}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users || []);
                    setTotal(data.total || 0);
                }
            } catch (err) {
                console.error(err);
            }
            setLoadingData(false);
        };
        fetchLeaderboard();
    }, [type, offset]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return (
        <div>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: '260px', padding: '2rem', paddingBottom: '5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏆 Leaderboard</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    See who&apos;s crushing it
                </p>

                {/* Type Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[
                        { key: 'focus', label: '⏱️ Focus Time' },
                        { key: 'streak', label: '🔥 Streaks' },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => { setType(t.key); setOffset(0); }}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: type === t.key ? 'var(--color-accent)' : 'var(--color-border)',
                                background: type === t.key ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                                color: type === t.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontWeight: type === t.key ? 600 : 400,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {loadingData ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
                    ) : users.length === 0 ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No data yet. Be the first on the leaderboard!
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {type === 'focus' ? 'Focus Time' : 'Streak'}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr
                                        key={i}
                                        className="animate-slide-in"
                                        style={{
                                            borderBottom: '1px solid var(--color-border)',
                                            background: u.rank <= 3 ? `rgba(108, 92, 231, ${0.1 - i * 0.02})` : 'transparent',
                                            animationDelay: `${i * 0.05}s`,
                                        }}
                                    >
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '1rem' }}>
                                            {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{u.avatarLevel?.emoji || '🦥'}</span>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{u.avatarLevel?.name || 'Lazy'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                                            {type === 'focus'
                                                ? `${u.totalFocusMinutes} min`
                                                : `${u.currentStreak} days`
                                            }
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--color-xp-gold)', fontWeight: 600, fontSize: '0.9rem' }}>
                                            {u.xp} XP
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                            disabled={offset === 0}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            ← Prev
                        </button>
                        <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setOffset(offset + limit)}
                            disabled={currentPage >= totalPages}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
