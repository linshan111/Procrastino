'use client';

import { useState } from 'react';

export default function CreateTaskModal({ isOpen, onClose, onCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [focusDuration, setFocusDuration] = useState(25);
    const [category, setCategory] = useState('general');
    const [microTasks, setMicroTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    if (!isOpen) return null;

    const addMicroTask = () => {
        setMicroTasks([...microTasks, '']);
    };

    const removeMicroTask = (index) => {
        setMicroTasks(microTasks.filter((_, i) => i !== index));
    };

    const updateMicroTask = (index, value) => {
        const updated = [...microTasks];
        updated[index] = value;
        setMicroTasks(updated);
    };

    const handleAIBreakdown = async () => {
        if (!title.trim()) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskTitle: title, taskDescription: description }),
            });
            const data = await res.json();
            if (data.microTasks) {
                setMicroTasks(data.microTasks.map((mt) => mt.text || mt));
                // Sum estimated minutes
                const totalMin = data.microTasks.reduce((sum, mt) => sum + (mt.estimatedMinutes || 5), 0);
                setFocusDuration(totalMin);
            }
        } catch (err) {
            console.error('AI breakdown error:', err);
        }
        setAiLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    focusDuration: Number(focusDuration),
                    microTasks: microTasks.filter((t) => t.trim()),
                    category,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                onCreated?.(data.task);
                setTitle('');
                setDescription('');
                setFocusDuration(25);
                setCategory('general');
                setMicroTasks([]);
                onClose();
            }
        } catch (err) {
            console.error('Create task error:', err);
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem',
        }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '540px',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>➕ Create Task</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                    }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Title *</label>
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to get done?"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Any details..."
                            rows={2}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Focus Time (min) *</label>
                            <input
                                className="input"
                                type="number"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(e.target.value)}
                                min={1}
                                max={480}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                            <select
                                className="input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="general">General</option>
                                <option value="work">Work</option>
                                <option value="study">Study</option>
                                <option value="coding">Coding</option>
                                <option value="writing">Writing</option>
                                <option value="health">Health</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Breakdown Button */}
                    <button
                        type="button"
                        onClick={handleAIBreakdown}
                        disabled={!title.trim() || aiLoading}
                        className="btn-secondary"
                        style={{
                            width: '100%',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(168, 85, 247, 0.1))',
                        }}
                    >
                        {aiLoading ? '🔄 Generating...' : '🧠 AI: Break into Micro-Tasks'}
                    </button>

                    {/* Micro Tasks */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Micro-Tasks</label>
                            <button
                                type="button"
                                onClick={addMicroTask}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-accent)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                }}
                            >
                                + Add Step
                            </button>
                        </div>
                        {microTasks.map((mt, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <input
                                    className="input"
                                    value={mt}
                                    onChange={(e) => updateMicroTask(i, e.target.value)}
                                    placeholder={`Step ${i + 1}`}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeMicroTask(i)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-danger)',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem',
                                        padding: '0 0.5rem',
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating...' : '🚀 Create Task'}
                    </button>
                </form>
            </div>
        </div>
    );
}
