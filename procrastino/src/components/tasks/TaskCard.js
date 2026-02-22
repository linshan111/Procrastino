'use client';

import { useRouter } from 'next/navigation';

export default function TaskCard({ task, onToggleMicroTask, onDelete }) {
    const router = useRouter();

    const statusColors = {
        pending: 'var(--color-warning)',
        active: 'var(--color-accent)',
        completed: 'var(--color-success)',
        abandoned: 'var(--color-danger)',
    };

    const completedMicro = task.microTasks?.filter((mt) => mt.completed).length || 0;
    const totalMicro = task.microTasks?.length || 0;

    return (
        <div className="card animate-fade-in" style={{ position: 'relative' }}>
            {/* Status Badge */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: `${statusColors[task.status]}20`,
                color: statusColors[task.status],
                border: `1px solid ${statusColors[task.status]}40`,
            }}>
                {task.status}
            </div>

            {/* Title & Description */}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', paddingRight: '6rem' }}>
                {task.title}
            </h3>
            {task.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    {task.description}
                </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                <span>⏱️ {task.focusDuration} min</span>
                <span>📁 {task.category}</span>
                {task.xpEarned > 0 && <span>⭐ {task.xpEarned} XP</span>}
            </div>

            {/* Micro Tasks */}
            {totalMicro > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Micro-tasks</span>
                        <span style={{ color: 'var(--color-accent)' }}>{completedMicro}/{totalMicro}</span>
                    </div>
                    <div className="xp-bar-bg" style={{ marginBottom: '0.5rem' }}>
                        <div className="xp-bar-fill" style={{
                            width: `${totalMicro > 0 ? (completedMicro / totalMicro) * 100 : 0}%`,
                            background: 'linear-gradient(90deg, var(--color-success), var(--color-accent))',
                        }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {task.microTasks.map((mt) => (
                            <label key={mt._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.8rem',
                                cursor: task.status === 'completed' ? 'default' : 'pointer',
                                color: mt.completed ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                textDecoration: mt.completed ? 'line-through' : 'none',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={mt.completed}
                                    onChange={() => onToggleMicroTask?.(task._id, mt._id)}
                                    disabled={task.status === 'completed' || task.status === 'abandoned'}
                                    style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                                />
                                {mt.text}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {task.status === 'pending' && (
                    <>
                        <button
                            onClick={() => router.push(`/focus?taskId=${task._id}`)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            🎯 Start Focus
                        </button>
                        <button
                            onClick={() => onDelete?.(task._id)}
                            className="btn-danger"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            🗑️
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
