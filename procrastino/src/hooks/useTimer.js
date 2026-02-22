'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export default function useTimer(totalSeconds, onComplete) {
    const [remaining, setRemaining] = useState(totalSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef(null);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const resume = useCallback(() => {
        setIsRunning(true);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setRemaining(totalSeconds);
        setElapsed(0);
    }, [totalSeconds]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        clearInterval(intervalRef.current);
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
                setElapsed((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, onComplete]);

    const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

    return {
        remaining,
        elapsed,
        isRunning,
        progress,
        start,
        pause,
        resume,
        reset,
        setRemaining,
        setElapsed,
    };
}
