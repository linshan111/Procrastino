'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WARNING_MESSAGES } from '@/lib/constants';

export default function useFocusDetection(isActive, onFocusLost, onFocusReturn) {
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isTabVisible, setIsTabVisible] = useState(true);
    const [currentWarning, setCurrentWarning] = useState('');
    const switchCountRef = useRef(0);

    const handleVisibilityChange = useCallback(() => {
        if (!isActive) return;

        if (document.hidden) {
            setIsTabVisible(false);
            onFocusLost?.();
        } else {
            setIsTabVisible(true);
            switchCountRef.current += 1;
            setTabSwitches(switchCountRef.current);

            const warningIdx = Math.min(switchCountRef.current - 1, WARNING_MESSAGES.length - 1);
            setCurrentWarning(WARNING_MESSAGES[warningIdx]);

            onFocusReturn?.(switchCountRef.current);
        }
    }, [isActive, onFocusLost, onFocusReturn]);

    const handleWindowBlur = useCallback(() => {
        if (!isActive) return;
        setIsTabVisible(false);
        onFocusLost?.();
    }, [isActive, onFocusLost]);

    const handleWindowFocus = useCallback(() => {
        if (!isActive) return;
        setIsTabVisible(true);
        switchCountRef.current += 1;
        setTabSwitches(switchCountRef.current);

        const warningIdx = Math.min(switchCountRef.current - 1, WARNING_MESSAGES.length - 1);
        setCurrentWarning(WARNING_MESSAGES[warningIdx]);

        onFocusReturn?.(switchCountRef.current);
    }, [isActive, onFocusReturn]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus]);

    const resetSwitches = useCallback(() => {
        switchCountRef.current = 0;
        setTabSwitches(0);
        setCurrentWarning('');
    }, []);

    return {
        tabSwitches,
        isTabVisible,
        currentWarning,
        resetSwitches,
    };
}
