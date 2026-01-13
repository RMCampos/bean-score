import { useEffect, useState, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
}: PullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    isPulling: false,
  });

  const touchStartY = useRef<number>(0);
  const scrollStartY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    // Only activate if we're at the top of the page
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      scrollStartY.current = scrollY;
      setState(prev => ({ ...prev, isPulling: true }));
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !state.isPulling || state.isRefreshing) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartY.current;

    // Only pull down when at top of page and pulling down
    if (scrollY === 0 && pullDistance > 0) {
      // Prevent default scrolling behavior
      e.preventDefault();

      // Apply resistance to make the pull feel natural
      const resistedDistance = Math.min(pullDistance / resistance, threshold * 1.5);

      setState(prev => ({
        ...prev,
        pullDistance: resistedDistance,
      }));
    }
  }, [enabled, state.isPulling, state.isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !state.isPulling) return;

    const shouldRefresh = state.pullDistance >= threshold;

    if (shouldRefresh) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } finally {
        setState({
          pullDistance: 0,
          isRefreshing: false,
          isPulling: false,
        });
      }
    } else {
      setState({
        pullDistance: 0,
        isRefreshing: false,
        isPulling: false,
      });
    }
  }, [enabled, state.isPulling, state.pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const options: AddEventListenerOptions = { passive: false };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    isPulling: state.isPulling,
    containerRef,
  };
};
