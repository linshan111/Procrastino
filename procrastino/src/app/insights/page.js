'use client';

import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';

export default function InsightsPage() {
    const { user, loading } = useAuth();
    const [insights, setInsights] = useState(null);
    const [fetching, setFetching] = useState(false);

    const fetchInsights = async () => {
        setFetching(true);
        try {
            const res = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id }),
            });
            setInsights(await res.json());
        } catch { setInsights({ fallback: true, message: 'Failed to load.', insights: [] }); }
        setFetching(false);
    };

    if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--color-text-muted)' }}>Loading...</p></div>;

    return (
        <div>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: '260px', padding: '2rem', paddingBottom: '5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>🧠 AI Insights</h1>

                {!insights ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Analyze Your Patterns</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>AI analyzes your sessions to reveal procrastination patterns.</p>
                        <button onClick={fetchInsights} className="btn-primary" disabled={fetching}>
                            {fetching ? '🔄 Analyzing...' : '🧠 Generate Insights'}
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {insights.fallback && <div className="card" style={{ marginBottom: '1rem', background: 'rgba(255,165,2,0.1)', border: '1px solid rgba(255,165,2,0.3)' }}><p style={{ color: 'var(--color-warning)' }}>ℹ️ {insights.message}</p></div>}
                        {insights.summary && <div className="card" style={{ marginBottom: '1.5rem' }}><p style={{ fontWeight: 500 }}>{insights.summary}</p></div>}
                        {insights.insights?.map((ins, i) => (
                            <div key={i} className="card" style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{ins.icon || '💡'}</span>
                                    <div><h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{ins.title}</h4><p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{ins.description}</p></div>
                                </div>
                            </div>
                        ))}
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}><button onClick={fetchInsights} className="btn-secondary" disabled={fetching}>{fetching ? '🔄...' : '🔄 Refresh'}</button></div>
                    </div>
                )}
            </main>
        </div>
    );
}
