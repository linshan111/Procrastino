'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

export default function TasksPage() {
    const { user, loading } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data.tasks || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchTasks();
    }, [user, filter]);

    const handleToggleMicroTask = async (taskId, microTaskId) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toggleMicroTask: microTaskId }),
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(tasks.map((t) => (t._id === taskId ? data.task : t)));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(tasks.filter((t) => t._id !== taskId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreated = (task) => {
        setTasks([task, ...tasks]);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    const filters = ['all', 'pending', 'active', 'completed', 'abandoned'];

    return (
        <div>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: '260px', padding: '2rem', paddingBottom: '5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>📋 Tasks</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            {tasks.length} total tasks
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        ➕ New Task
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.4rem 0.9rem',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: filter === f ? 'var(--color-accent)' : 'var(--color-border)',
                                background: filter === f ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                                color: filter === f ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: filter === f ? 600 : 400,
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                {tasks.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📝</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No tasks yet</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Create your first task to start being productive!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onToggleMicroTask={handleToggleMicroTask}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
            </main>
        </div>
    );
}
