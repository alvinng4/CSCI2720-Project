/**
 * Simple hook for async components
 */

import { useCallback, useRef, useState } from "react";

export default function useAsync({
  initialForegroundLoading = false,
  initialBackgroundLoading = false,
  foregroundDelayMs = 300,
  backgroundDelayMs = 0,
} = {}) {
  const [isForegroundLoading, setIsForegroundLoading] = useState(
    initialForegroundLoading
  );
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(
    initialBackgroundLoading
  );
  const foregroundTimeoutRef = useRef(null);
  const backgroundTimeoutRef = useRef(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const startForegroundLoading = useCallback(() => {
    if (foregroundTimeoutRef.current) {
      clearTimeout(foregroundTimeoutRef.current);
    }

    foregroundTimeoutRef.current = setTimeout(() => {
      setIsForegroundLoading(true);
    }, foregroundDelayMs);
  }, [foregroundDelayMs]);

  const stopForegroundLoading = useCallback((setSyncTime = true) => {
    if (foregroundTimeoutRef.current) {
      clearTimeout(foregroundTimeoutRef.current);
      foregroundTimeoutRef.current = null;
    }

    if (setSyncTime) {
      setLastSyncTime(new Date());
    }
    setIsForegroundLoading(false);
  }, []);

  const startBackgroundLoading = useCallback(() => {
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
    }

    backgroundTimeoutRef.current = setTimeout(() => {
      setIsBackgroundLoading(true);
    }, backgroundDelayMs);
  }, [backgroundDelayMs]);

  const stopBackgroundLoading = useCallback((setSyncTime = false) => {
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
      backgroundTimeoutRef.current = null;
    }

    if (setSyncTime) {
      setLastSyncTime(new Date());
    }
    setIsBackgroundLoading(false);
  }, []);

  return {
    isLoading: isForegroundLoading || isBackgroundLoading,
    isForegroundLoading,
    isBackgroundLoading,
    lastSyncTime,
    startForegroundLoading,
    stopForegroundLoading,
    startBackgroundLoading,
    stopBackgroundLoading,
  };
}
