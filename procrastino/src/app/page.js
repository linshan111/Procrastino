'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/stores/appStore';

export default function Home() {
  const router = useRouter();
  const { fetchUser } = useAppStore();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };
    check();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
    }}>
      <div style={{ textAlign: 'center' }} className="animate-fade-in">
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #6c5ce7, #a855f7, #f9ca24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>
          ProcrastiNO
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Loading...</p>
      </div>
    </div>
  );
}
