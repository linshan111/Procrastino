'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useTimer from '@/hooks/useTimer';
import useFocusDetection from '@/hooks/useFocusDetection';
import Sidebar from '@/components/layout/Sidebar';
import FocusTimerDisplay from '@/components/focus/FocusTimer';
import WarningOverlay from '@/components/focus/WarningOverlay';
import { FALLBACK_ROASTS } from '@/lib/constants';

function FocusContent() {
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [session, setSession] = useState(null);
    const [task, setTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [xpResult, setXpResult] = useState(null);
    const [roast, setRoast] = useState('');
    const [starting, setStarting] = useState(false);

    const handleComplete = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/focus', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session._id,
                    action: 'complete',
                    actualFocusTime: timer.elapsed,
                    tabSwitches: focusDetection.tabSwitches,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setXpResult(data);
                setSessionComplete(true);
            }
        } catch (err) {
            console.error(err);
        }
    }, [session]);

    const timer = useTimer(
        session ? session.plannedDuration * 60 : 0,
        handleComplete
    );

    const focusDetection = useFocusDetection(
        timer.isRunning,
        () => { timer.pause(); },
        (switches) => { setShowWarning(true); }
    );

    // Load tasks on mount
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const res = await fetch('/api/tasks?status=pending');
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data.tasks || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (user) loadTasks();
    }, [user]);

    // Auto-select task from URL
    useEffect(() => {
        const taskId = searchParams.get('taskId');
        if (taskId) setSelectedTask(taskId);
    }, [searchParams]);

    // Check for active session
    useEffect(() => {
        const checkActive = async () => {
            try {
                const res = await fetch('/api/focus?active=true');
                if (res.ok) {
                    const data = await res.json();
                    if (data.session) {
                        setSession(data.session);
                        setTask(data.session.taskId);
                        const remainTime = data.session.plannedDuration * 60 - data.session.actualFocusTime;
                        timer.setRemaining(Math.max(0, remainTime));
                        timer.setElapsed(data.session.actualFocusTime);
                        timer.start();
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (user && !session) checkActive();
    }, [user]);

    const handleStart = async () => {
        if (!selectedTask || starting) return;
        setStarting(true);
        try {
            const res = await fetch('/api/focus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: selectedTask }),
            });
            if (res.ok) {
                const data = await res.json();
                setSession(data.session);
                const taskData = tasks.find((t) => t._id === selectedTask);
                setTask(taskData);
                timer.setRemaining(data.session.plannedDuration * 60);
                timer.start();
            }
        } catch (err) {
            console.error(err);
        }
        setStarting(false);
    };

    const handleAbandon = async () => {
        if (!session) return;
        timer.pause();

        try {
            const res = await fetch('/api/focus', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session._id,
                    action: 'abandon',
                    actualFocusTime: timer.elapsed,
                    tabSwitches: focusDetection.tabSwitches,
                }),
            });

            // Get roast
            try {
                const roastRes = await fetch('/api/ai/roast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context: 'abandon' }),
                });
                if (roastRes.ok) {
                    const roastData = await roastRes.json();
                    setRoast(roastData.roast);
                }
            } catch {
                setRoast(FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)]);
            }

            if (res.ok) {
                const data = await res.json();
                setXpResult(data);
                setSessionComplete(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDismissWarning = () => {
        setShowWarning(false);
        timer.resume();
    };

    const handleNewSession = () => {
        setSession(null);
        setTask(null);
        setSessionComplete(false);
        setXpResult(null);
        setRoast('');
        setSelectedTask('');
        timer.reset();
        focusDetection.resetSwitches();
        // Reload tasks
        fetch('/api/tasks?status=pending')
            .then((r) => r.json())
            .then((data) => setTasks(data.tasks || []))
            .catch(() => { });
    };

    // Periodic save
    useEffect(() => {
        if (!session || !timer.isRunning) return;
        const saveInterval = setInterval(async () => {
            try {
                await fetch('/api/focus', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: session._id,
                        action: 'update',
                        actualFocusTime: timer.elapsed,
                        tabSwitches: focusDetection.tabSwitches,
                    }),
                });
            } catch (err) {
                console.error(err);
            }
        }, 30000);
        return () => clearInterval(saveInterval);
    }, [session, timer.isRunning, timer.elapsed, focusDetection.tabSwitches]);

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

                {/* Warning Overlay */}
                {showWarning && (
                    <WarningOverlay
                        message={focusDetection.currentWarning}
                        tabSwitches={focusDetection.tabSwitches}
                        onDismiss={handleDismissWarning}
                    />
                )}

                {/* Session Complete */}
                {sessionComplete ? (
                    <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                            {xpResult?.xpGained ? '🎉' : '💀'}
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            color: xpResult?.xpGained ? 'var(--color-success)' : 'var(--color-danger)',
                        }}>
                            {xpResult?.xpGained ? 'Session Complete!' : 'Session Abandoned'}
                        </h1>

                        {xpResult?.xpGained > 0 && (
                            <div className="animate-xp-pop" style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(249, 202, 36, 0.2), rgba(108, 92, 231, 0.2))',
                                border: '1px solid rgba(249, 202, 36, 0.4)',
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: 'var(--color-xp-gold)',
                            }}>
                                +{xpResult.xpGained} XP ⭐
                            </div>
                        )}

                        {xpResult?.xpLost > 0 && (
                            <div className="animate-shake" style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                background: 'rgba(255, 71, 87, 0.15)',
                                border: '1px solid rgba(255, 71, 87, 0.4)',
                                marginBottom: '1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--color-danger)',
                            }}>
                                -{xpResult.xpLost} XP 💔
                            </div>
                        )}

                        {roast && (
                            <div style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                marginTop: '1rem',
                                marginBottom: '1.5rem',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    🤖 AI Roast
                                </p>
                                <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                                    &ldquo;{roast}&rdquo;
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <button onClick={handleNewSession} className="btn-primary">
                                🎯 New Session
                            </button>
                            <button onClick={() => router.push('/dashboard')} className="btn-secondary">
                                📊 Dashboard
                            </button>
                        </div>
                    </div>
                ) : session ? (
                    /* Active Session */
                    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            🎯 Focus Mode
                        </h1>
                        {task && (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                Working on: <strong style={{ color: 'var(--color-accent)' }}>{task.title}</strong>
                            </p>
                        )}

                        <FocusTimerDisplay
                            remaining={timer.remaining}
                            progress={timer.progress}
                            isRunning={timer.isRunning}
                            tabSwitches={focusDetection.tabSwitches}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
                            {timer.isRunning ? (
                                <button onClick={timer.pause} className="btn-secondary">
                                    ⏸ Pause
                                </button>
                            ) : (
                                <button onClick={timer.resume} className="btn-primary">
                                    ▶ Resume
                                </button>
                            )}
                            <button onClick={handleComplete} className="btn-primary">
                                ✅ Complete
                            </button>
                            <button onClick={handleAbandon} className="btn-danger">
                                🚪 Abandon
                            </button>
                        </div>

                        {/* Session Info */}
                        <div className="card" style={{ marginTop: '2rem', textAlign: 'left' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Elapsed</p>
                                    <p style={{ fontWeight: 600 }}>
                                        {Math.floor(timer.elapsed / 60)}m {timer.elapsed % 60}s
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Tab Switches</p>
                                    <p style={{ fontWeight: 600, color: focusDetection.tabSwitches > 5 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                                        {focusDetection.tabSwitches}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Est. XP</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-xp-gold)' }}>
                                        +{Math.floor(timer.elapsed / 60) * 2 + 10} XP
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Progress</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                                        {Math.round(timer.progress)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Select Task */
                    <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '3rem auto' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
                            🎯 Start Focus Session
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2rem' }}>
                            Select a task and get to work!
                        </p>

                        <div className="card">
                            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                Choose a Task
                            </label>
                            {tasks.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    No pending tasks. <a href="/tasks" style={{ color: 'var(--color-accent)' }}>Create one first.</a>
                                </p>
                            ) : (
                                <>
                                    <select
                                        className="input"
                                        value={selectedTask}
                                        onChange={(e) => setSelectedTask(e.target.value)}
                                        style={{ marginBottom: '1.25rem' }}
                                    >
                                        <option value="">Select a task...</option>
                                        {tasks.map((t) => (
                                            <option key={t._id} value={t._id}>
                                                {t.title} ({t.focusDuration} min)
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleStart}
                                        className="btn-primary"
                                        style={{ width: '100%' }}
                                        disabled={!selectedTask || starting}
                                    >
                                        {starting ? '⏳ Starting...' : '🚀 Start Focus'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function FocusPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
        }>
            <FocusContent />
        </Suspense>
    );
}
