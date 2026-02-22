'use client';

import Link from 'next/link';

export default function QuickActions() {
    return (
        <div className="card" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/tasks" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    ➕ New Task
                </Link>
                <Link href="/focus" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎯 Start Focus
                </Link>
                <Link href="/insights" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧠 AI Insights
                </Link>
            </div>
        </div>
    );
}
