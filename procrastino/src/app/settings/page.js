'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useAppStore from '@/stores/appStore';
import Sidebar from '@/components/layout/Sidebar';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const { fetchUser } = useAppStore();
    const [prefs, setPrefs] = useState({
        loseStreak: true, deductPoints: true, roast: true, annoyingEffect: true, donationMock: true,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user?.punishmentPrefs) setPrefs(user.punishmentPrefs);
    }, [user]);

    const togglePref = (key) => setPrefs({ ...prefs, [key]: !prefs[key] });

    if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--color-text-muted)' }}>Loading...</p></div>;

    const punishments = [
        { key: 'loseStreak', label: 'Lose Streak', desc: 'Reset streak on missed days', icon: '🔥' },
        { key: 'deductPoints', label: 'Deduct XP', desc: 'Lose XP when abandoning sessions', icon: '⭐' },
        { key: 'roast', label: 'AI Roast', desc: 'Get roasted when you procrastinate', icon: '🤖' },
        { key: 'annoyingEffect', label: 'Annoying Effects', desc: 'Screen shake and warnings on tab switch', icon: '💥' },
        { key: 'donationMock', label: 'Donation Penalty', desc: 'Mock donation penalty on abandonment', icon: '💸' },
    ];

    return (
        <div>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: '260px', padding: '2rem', paddingBottom: '5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚙️ Settings</h1>

                {/* Profile */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>👤 Profile</h3>
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div><span style={{ color: 'var(--color-text-muted)' }}>Name:</span> {user.name}</div>
                        <div><span style={{ color: 'var(--color-text-muted)' }}>Email:</span> {user.email}</div>
                        <div><span style={{ color: 'var(--color-text-muted)' }}>Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Punishment Preferences */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>⚡ Punishment Engine</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Choose your consequences</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {punishments.map((p) => (
                            <label key={p.key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem', borderRadius: '10px', background: 'var(--color-bg-input)',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.label}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.desc}</p>
                                    </div>
                                </div>
                                <div style={{
                                    width: '44px', height: '24px', borderRadius: '12px',
                                    background: prefs[p.key] ? 'var(--color-accent)' : 'var(--color-border)',
                                    position: 'relative', transition: 'background 0.2s',
                                }} onClick={() => togglePref(p.key)}>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: '3px',
                                        left: prefs[p.key] ? '23px' : '3px', transition: 'left 0.2s',
                                    }} />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {saved && <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,210,160,0.15)', color: 'var(--color-success)', textAlign: 'center', fontSize: '0.85rem' }}>✅ Settings saved</div>}
            </main>
        </div>
    );
}
