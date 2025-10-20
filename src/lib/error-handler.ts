// src/lib/error-handler.ts
// Global error handler untuk menangani disconnected port errors

export function initializeErrorHandler() {
  if (typeof window === 'undefined') return;

  // Tangkap uncaught errors
  window.addEventListener('error', (event: ErrorEvent) => {
    // Ignore "disconnected port object" errors - biasanya dari extension
    if (
      event.message?.includes('disconnected port') ||
      event.message?.includes('port object') ||
      event.message?.includes('Extension context invalidated')
    ) {
      console.warn('⚠️ [Ignored] Port connection error:', event.message);
      event.preventDefault();
      return false;
    }
  });

  // Tangkap unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason?.message?.includes('disconnected port')) {
      console.warn('⚠️ [Ignored] Unhandled Promise rejection - Port connection error');
      event.preventDefault();
      return false;
    }
  });

  // Handle port disconnect dari extensions
  if ((window as any).chrome?.runtime?.onMessage) {
    try {
      (window as any).chrome.runtime.onMessage.addListener(
        (request: any, sender: any, sendResponse: any) => {
          // Jangan throw error, cukup log
          return false;
        }
      );
    } catch (error) {
      // Abaikan
    }
  }
}