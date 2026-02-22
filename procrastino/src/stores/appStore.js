'use client';

import { create } from 'zustand';

const useAppStore = create((set, get) => ({
    user: null,
    loading: true,
    tasks: [],
    activeSession: null,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setTasks: (tasks) => set({ tasks }),
    setActiveSession: (session) => set({ activeSession: session }),

    fetchUser: async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                set({ user: data.user, loading: false });
            } else {
                set({ user: null, loading: false });
            }
        } catch {
            set({ user: null, loading: false });
        }
    },

    fetchTasks: async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                set({ tasks: data.tasks });
            }
        } catch (err) {
            console.error('Fetch tasks error:', err);
        }
    },

    logout: async () => {
        await fetch('/api/auth/me', { method: 'DELETE' });
        set({ user: null });
        window.location.href = '/login';
    },
}));

export default useAppStore;
