'use client';

import { useEffect } from 'react';
import { initializeErrorHandler } from '@/lib/error-handler';

export function ClientErrorHandler() {
    useEffect(() => {
        // Initialize global error handler
        initializeErrorHandler();
    }, []);

    return null;
}