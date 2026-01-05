/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';

type ReCaptchaInstance = {
  ready: (callback: () => void) => void;
  render: (container: HTMLElement, config: { sitekey: string; size: string; theme: string }) => number;
  reset: (id: number) => void;
  getResponse: (id: number) => string;
  execute: (id: number) => void;
};

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v2-script';
let scriptLoadPromise: Promise<void> | null = null;
let recaptchaLoaded = false;

function loadRecaptchaScript(): Promise<void> {
  if (recaptchaLoaded && (window as any).grecaptcha) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // If script already exists and grecaptcha is loaded
    if (document.getElementById(RECAPTCHA_SCRIPT_ID) && (window as any).grecaptcha) {
      recaptchaLoaded = true;
      resolve();
      return;
    }

    // Set up the callback for when the script loads
    const originalCallback = (window as any).onRecaptchaLoaded;
    (window as any).onRecaptchaLoaded = () => {
      recaptchaLoaded = true;
      if (originalCallback) originalCallback();
      resolve();
    };

    // Create and append the script
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function useRecaptchaV2(siteKey: string) {
  const widgetId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupPerformed = useRef(false);

  const cleanup = useCallback(() => {
    if (cleanupPerformed.current) return;
    
    if (widgetId.current !== null) {
      const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
      if (grecaptcha && typeof grecaptcha.reset === 'function') {
        try {
          grecaptcha.reset(widgetId.current);
        } catch (error) {
          console.error('Error resetting reCAPTCHA:', error);
        }
      }
      widgetId.current = null;
    }
    
    // Clean up container element
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    setIsReady(false);
    cleanupPerformed.current = true;
  }, []);

  const initializeRecaptcha = useCallback(async () => {
    if (!containerRef.current || !siteKey) {
      setError('Container ref or siteKey not available');
      return;
    }

    try {
      // Clear any previous errors
      setError(null);
      
      // Clean up existing widget first
      cleanup();
      cleanupPerformed.current = false;

      // Load the script
      await loadRecaptchaScript();

      const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
      if (!grecaptcha) {
        throw new Error('reCAPTCHA library not loaded');
      }

      // Wait for grecaptcha to be ready
      await new Promise<void>((resolve) => {
        grecaptcha.ready(() => {
          // Double-check that the container is still available
          if (!containerRef.current) {
            throw new Error('Container element no longer available');
          }
          
          // Clear the container to ensure we don't re-render in the same element
          containerRef.current.innerHTML = '';
          
          // Render the widget
          widgetId.current = grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            size: 'normal',
            theme: 'light',
          });
          
          setIsReady(true);
          resolve();
        });
      });
    } catch (error: any) {
      console.error('Error initializing reCAPTCHA:', error);
      setError(error.message || 'Failed to initialize reCAPTCHA');
      setIsReady(false);
    }
  }, [siteKey, cleanup]);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      // Small delay to ensure container is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isMounted && containerRef.current && siteKey) {
        await initializeRecaptcha();
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [siteKey, initializeRecaptcha, cleanup]);

  const getToken = (): string => {
    const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
    if (!grecaptcha || widgetId.current === null || !isReady) {
      throw new Error('reCAPTCHA not initialized');
    }
    
    const token = grecaptcha.getResponse(widgetId.current);
    if (!token) {
      throw new Error('No reCAPTCHA token available. Please complete the challenge.');
    }
    
    return token;
  };

  const resetCaptcha = useCallback(() => {
    const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
    if (!grecaptcha || widgetId.current === null) return;

    try {
      grecaptcha.reset(widgetId.current);
      setIsReady(false);
      
      // Re-initialize after reset
      setTimeout(() => {
        initializeRecaptcha();
      }, 100);
    } catch (error) {
      console.error('Error resetting reCAPTCHA:', error);
      setError('Failed to reset reCAPTCHA');
    }
  }, [initializeRecaptcha]);

  const execute = useCallback(() => {
    const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
    if (!grecaptcha || widgetId.current === null) return;
    
    try {
      grecaptcha.execute(widgetId.current);
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
    }
  }, []);

  return {
    containerRef,
    getToken,
    resetCaptcha,
    initializeRecaptcha,
    execute,
    isReady,
    error,
  };
}