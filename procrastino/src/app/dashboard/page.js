'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import StatsOverview from '@/components/dashboard/StatsOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import AvatarDisplay from '@/components/gamification/AvatarDisplay';
import XPBar from '@/components/gamification/XPBar';
import StreakDisplay from '@/components/gamification/StreakDisplay';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/tasks');
                if (res.ok) {
                    const data = await res.json();
                    setRecentTasks(data.tasks?.slice(0, 5) || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchRecent();
    }, [user]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: '260px', padding: '2rem', paddingBottom: '5rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        Welcome back, {user.name} 👋
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Ready to crush some tasks today?
                    </p>
                </div>

                {/* Stats */}
                <StatsOverview user={user} />

                {/* Quick Actions */}
                <QuickActions />

                {/* Two Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {/* Avatar & XP */}
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🎮 Your Avatar</h3>
                        <AvatarDisplay xp={user.xp} />
                        <div style={{ marginTop: '1.5rem' }}>
                            <XPBar xp={user.xp} />
                        </div>
                    </div>

                    {/* Streak */}
                    <div>
                        <StreakDisplay streak={user.currentStreak} longestStreak={user.longestStreak} />

                        {/* Recent Tasks */}
                        <div className="card" style={{ marginTop: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Recent Tasks</h3>
                            {recentTasks.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    No tasks yet. Create one to get started!
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {recentTasks.map((task) => (
                                        <div key={task._id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.6rem 0.75rem',
                                            borderRadius: '8px',
                                            background: 'var(--color-bg-input)',
                                            fontSize: '0.85rem',
                                        }}>
                                            <span style={{
                                                color: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-primary)',
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            }}>
                                                {task.status === 'completed' ? '✅' : task.status === 'abandoned' ? '❌' : '📌'} {task.title}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                {task.focusDuration}m
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
