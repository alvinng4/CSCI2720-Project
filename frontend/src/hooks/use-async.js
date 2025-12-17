/**
 * Simple hook for async components
 */

import { useCallback, useRef, useState } from "react";

export default function useAsync() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const timeoutRef = useRef(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to show loading after 750ms
    timeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, 300);
  }, []);

  const stopLoading = useCallback(() => {
    // Clear timeout if loading was stopped before 750ms
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setLastSyncTime(new Date());
    setIsLoading(false);
    setShowLoading(false);
    setShowInitialLoading(false);
  }, []);

  return {
    isLoading,
    showLoading,
    showInitialLoading,
    lastSyncTime,
    startLoading,
    stopLoading,
  };
}
