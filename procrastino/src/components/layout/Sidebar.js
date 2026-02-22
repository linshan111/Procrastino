'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAppStore from '@/stores/appStore';
import { AVATAR_LEVELS } from '@/lib/constants';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'Tasks', icon: '📋' },
    { href: '/focus', label: 'Focus', icon: '🎯' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/insights', label: 'AI Insights', icon: '🧠' },
    { href: '/ai-planner', label: 'AI Planner', icon: '🤖' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAppStore();

    const avatarLevel = user?.avatarLevel || AVATAR_LEVELS[0];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar" style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '260px',
                background: 'var(--color-bg-secondary)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                overflowY: 'auto',
            }}>
                {/* Logo */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                    }}>
                        ProcrastiNO
                    </h1>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        You can scroll… after you finish.
                    </p>
                </div>

                {/* User Card */}
                {user && (
                    <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--color-border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                            }}>
                                {avatarLevel.emoji}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    {avatarLevel.name}
                                </p>
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--color-xp-gold)' }}>⭐ {user.xp} XP</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                    🔥 {user.currentStreak} streak
                                </span>
                            </div>
                            <div className="xp-bar-bg">
                                <div className="xp-bar-fill" style={{
                                    width: `${Math.min(100, (user.xp / (avatarLevel.level < 4 ? AVATAR_LEVELS[avatarLevel.level]?.minXP || 1500 : 1500)) * 100)}%`
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '0.75rem' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                marginBottom: '4px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--color-text-secondary)',
                                background: isActive ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(168, 85, 247, 0.1))' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={logout} style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={(e) => { e.target.style.borderColor = 'var(--color-danger)'; e.target.style.color = 'var(--color-danger)'; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.color = 'var(--color-text-secondary)'; }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-nav" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--color-bg-secondary)',
                borderTop: '1px solid var(--color-border)',
                justifyContent: 'space-around',
                padding: '0.5rem 0',
                zIndex: 50,
            }}>
                {navItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            textDecoration: 'none',
                            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            fontSize: '0.65rem',
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
