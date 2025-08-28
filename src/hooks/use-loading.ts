import { useState, useCallback } from 'react';

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
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
    });
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
  };
}