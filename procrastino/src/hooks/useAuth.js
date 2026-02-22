'use client';

import { useEffect } from 'react';
import useAppStore from '@/stores/appStore';

export default function useAuth(requireAuth = true) {
    const { user, loading, fetchUser } = useAppStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!loading && !user && requireAuth) {
            window.location.href = '/login';
        }
    }, [loading, user, requireAuth]);

    return { user, loading };
}
