import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LoadingState = {
  isLoading: boolean;
  progress: number;
  message: string;
};

export function useLoading(initialState = false) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialState,
    progress: 0,
    message: '',
  });

  const startLoading = useCallback((message = 'Loading...') => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message,
    });

    // Simulate progress
    const interval = setInterval(() => {
      setLoadingState(prev => {
        if (prev.progress >= 90) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          progress: prev.progress + 10,
        };
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message,
    }));
  }, []);

  const stopLoading = useCallback(() => {
    // Complete the progress before stopping
    setLoadingState(prev => ({
      ...prev,
      progress: 100,
    }));

    // Delay to show 100% before hiding
    const timer = setTimeout(() => {
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: '',
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const LoadingBar = () => (
    <AnimatePresence>
      {loadingState.isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-1 w-full bg-primary/20 overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{
                width: `${loadingState.progress}%`,
                transition: { duration: 0.3, ease: 'easeInOut' },
              }}
            />
          </motion.div>
          {loadingState.message && (
            <div className="bg-background/80 backdrop-blur-sm p-2 text-sm text-center">
              {loadingState.message}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
    LoadingBar,
  };
}

type DelayedRenderProps = {
  delay?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function DelayedRender({ delay = 200, children, fallback = null }: DelayedRenderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return <>{fallback}</>;
  return <>{children}</>;
}

export function withLoading<T>(
  Component: React.ComponentType<T>,
  LoadingComponent: React.ComponentType<{}> = () => <div>Loading...</div>
) {
  return function WithLoadingComponent(props: T & { isLoading?: boolean }) {
    const { isLoading, ...rest } = props;
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <Component {...(rest as T)} />;
  };
}
