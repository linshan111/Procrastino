'use client';

import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import StudyPlannerChat from '@/components/ai/StudyPlannerChat';

export default function AIPlannerPage() {
    const { user, loading } = useAuth();

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
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        🤖 AI Study Planner
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Describe what you need to study, and our MegaLLM-powered AI will generate a structured plan with actionable tasks.
                    </p>
                </div>

                <StudyPlannerChat />
            </main>
        </div>
    );
}
