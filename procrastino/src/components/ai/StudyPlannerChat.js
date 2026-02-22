'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudyPlannerChat() {
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [creatingTasks, setCreatingTasks] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);

    // Load from local storage immediately on mount
    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('ai_planner_chats');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) {
                    setChats(parsed);
                    setCurrentChatId(parsed[0].id);
                    return;
                }
            } catch (e) {
                console.error("Error parsing AI chats");
            }
        }
        createNewChat();
    }, []);

    // Sync to local storage
    useEffect(() => {
        if (isClient && chats.length > 0) {
            localStorage.setItem('ai_planner_chats', JSON.stringify(chats));
        }
    }, [chats, isClient]);

    const activeChat = chats.find(c => c.id === currentChatId);
    const messages = activeChat ? activeChat.messages : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const createNewChat = () => {
        const id = Date.now().toString();
        const newChat = { id, title: 'New Plan', messages: [] };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(id);
        setInput('');
        setSuccessMsg('');
    };

    const deleteChat = (e, id) => {
        e.stopPropagation();
        setChats(prev => {
            const updated = prev.filter(c => c.id !== id);
            // If they deleted all chats
            if (updated.length === 0) {
                const newId = Date.now().toString();
                setCurrentChatId(newId);
                return [{ id: newId, title: 'New Plan', messages: [] }];
            }
            // If they deleted the active chat, fall back to first
            if (currentChatId === id) {
                setCurrentChatId(updated[0].id);
            }
            return updated;
        });
    };

    const parseMessage = (content) => {
        let textFallback = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        const match = content.match(/```(?:json)?\s*(\{[\s\S]*?)(?:```|$)/i);
        let jsonStr = match ? match[1] : null;

        if (!jsonStr) {
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonStr = content.substring(firstBrace, lastBrace + 1);
            }
        }

        if (jsonStr) {
            try {
                const plan = JSON.parse(jsonStr);
                return { text: content.replace(match ? match[0] : jsonStr, '').replace(/```(?:json)?/gi, '').replace(/```/g, '').trim(), plan };
            } catch (e) {
                try {
                    let partial = jsonStr.replace(/,\s*$/, '').replace(/,\s*"[^"]*"\s*:\s*"?[^",}]*"?\s*$/, '');
                    const caps = ['}', ']}', ']}]}', ']}', '"]}]}'];
                    for (let c of caps) {
                        try {
                            const plan = JSON.parse(partial + c);
                            if (plan && plan.tasks) return { text: textFallback.replace(partial, '').replace(/[\{\}\[\]]/g, '').trim(), plan };
                        } catch (err) { }
                    }
                } catch (e) { }
            }
        }

        return { text: textFallback, plan: null };
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeChat) return;

        const userMessage = { role: 'user', content: input };
        const newHistory = [...messages, userMessage];

        let newTitle = activeChat.title;
        if (activeChat.messages.length === 0) {
            newTitle = input.substring(0, 30) + (input.length > 30 ? '...' : '');
        }

        const updateChats = (newMsgs, title) => {
            setChats(prev => prev.map(c =>
                c.id === currentChatId ? { ...c, messages: newMsgs, title } : c
            ));
        };

        updateChats(newHistory, newTitle);
        setInput('');
        setLoading(true);
        setSuccessMsg('');

        try {
            const res = await fetch('/api/ai/study-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newHistory.map(m => ({ role: m.role, content: m.content })) }),
            });

            const data = await res.json();

            if (res.ok) {
                updateChats([...newHistory, { role: 'assistant', content: data.reply }], newTitle);
            } else {
                updateChats([...newHistory, { role: 'assistant', content: `❌ Error: ${data.error || 'Failed to get response. Try again.'}`, isError: true }], newTitle);
            }
        } catch (err) {
            updateChats([...newHistory, { role: 'assistant', content: '❌ Network error. Please try again.', isError: true }], newTitle);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTasks = async (plan) => {
        if (!plan || !plan.tasks) return;
        setCreatingTasks(true);

        try {
            const res = await fetch('/api/ai/create-plan-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: plan.tasks }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg('✅ Tasks added to your list successfully! Redirecting...');
                setTimeout(() => router.push('/tasks'), 2000);
            } else {
                alert(data.error || 'Failed to create tasks');
            }
        } catch (err) {
            alert('Network error while creating tasks.');
        } finally {
            setCreatingTasks(false);
        }
    };

    if (!isClient) return null;

    return (
        <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '600px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Sidebar for Chat History */}
            <div style={{
                width: '280px',
                background: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                flexShrink: 0
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <button onClick={createNewChat} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <span>+</span> New Chat
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                background: currentChatId === chat.id ? 'var(--color-bg-primary)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                borderLeft: currentChatId === chat.id ? '3px solid var(--color-accent)' : '3px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '0.9rem', color: currentChatId === chat.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: currentChatId === chat.id ? 600 : 400 }}>
                                💬 {chat.title}
                            </span>
                            <button
                                onClick={(e) => deleteChat(e, chat.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.2rem', fontSize: '1rem' }}
                                title="Delete Chat"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0, padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 'auto' }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👋 Hello!</p>
                            <p style={{ maxWidth: '400px', lineHeight: '1.5' }}>I am your AI Planner. Tell me what big goal, exam, or project you want to tackle and I will break it down into actionable tasks for you.</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const { text, plan } = msg.role === 'assistant' && !msg.isError ? parseMessage(msg.content) : { text: msg.content, plan: null };

                        return (
                            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                {/* Chat Bubble Text */}
                                {text && (
                                    <div style={{
                                        padding: '1rem 1.2rem',
                                        borderRadius: '16px',
                                        background: msg.role === 'user' ? 'var(--color-accent)' : msg.isError ? 'rgba(255, 71, 87, 0.2)' : 'var(--color-bg-secondary)',
                                        color: msg.role === 'user' ? '#fff' : msg.isError ? 'var(--color-danger)' : 'var(--color-text-primary)',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                        borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                                        lineHeight: '1.6',
                                        marginBottom: '1rem',
                                        whiteSpace: 'pre-line' // Respect line breaks from AI
                                    }}>
                                        {text}
                                    </div>
                                )}

                                {/* Parsed JSON Plan Card */}
                                {plan && (
                                    <div className="animate-fade-in" style={{ padding: '1.5rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-accent)' }}>📋 Proposed Plan</h3>
                                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{plan.summary}</p>

                                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                            {plan.tasks?.map((task, tidx) => (
                                                <div key={tidx} style={{ padding: '1rem', background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{task.title}</h4>
                                                        <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'var(--color-bg-input)', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--color-accent)' }}>
                                                            ⏱️ {task.focusDuration}m
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>{task.description}</p>
                                                    {task.microTasks && task.microTasks.length > 0 && (
                                                        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                            {task.microTasks.map((mt, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{mt.text}</li>)}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {plan.tips && <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(108, 92, 231, 0.05)', borderRadius: '8px' }}><strong>✨ Tips:</strong> {plan.tips.join(' • ')}</div>}

                                        <button
                                            onClick={() => handleCreateTasks(plan)}
                                            className="btn-primary"
                                            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 700 }}
                                            disabled={creatingTasks}
                                        >
                                            {creatingTasks ? '⏳ Saving Tasks...' : '✨ Looks good! Add to Tasks list'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {loading && (
                        <div style={{ alignSelf: 'flex-start', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '16px', borderTopLeftRadius: '4px', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                            🤖 AI is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {successMsg && (
                    <div style={{ color: 'var(--color-success)', marginBottom: '1rem', padding: '1rem', background: 'rgba(0, 210, 160, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                        {successMsg}
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        className="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your goals here..."
                        style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                        disabled={loading || creatingTasks}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }} disabled={loading || !input.trim() || creatingTasks}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
