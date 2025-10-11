import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

/**
 * Custom hook for chat optimization
 * Handles listener cleanup and app state management
 */
export const useChatOptimization = () => {
  const listenersRef = useRef(new Set());
  const isActiveRef = useRef(true);

  // Register a listener for cleanup
  const registerListener = useCallback((listener) => {
    listenersRef.current.add(listener);
    return listener;
  }, []);

  // Unregister a listener
  const unregisterListener = useCallback((listener) => {
    listenersRef.current.delete(listener);
    if (typeof listener === 'function') {
      listener(); // Call unsubscribe function
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        isActiveRef.current = false;
        // Optionally pause listeners when app is backgrounded
      } else if (nextAppState === 'active') {
        isActiveRef.current = true;
        // Resume listeners when app becomes active
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(listener => {
        if (typeof listener === 'function') {
          listener();
        }
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    registerListener,
    unregisterListener,
    isActive: isActiveRef.current
  };
};

/**
 * Hook for message pagination
 */
export const useMessagePagination = (conversationId, initialLimit = 50) => {
  const hasMoreRef = useRef(true);
  const lastMessageRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (loadMoreMessages) => {
    if (loadingRef.current || !hasMoreRef.current || !conversationId) {
      return { messages: [], hasMore: false };
    }

    loadingRef.current = true;

    try {
      const result = await loadMoreMessages(
        conversationId,
        lastMessageRef.current?.timestamp,
        initialLimit
      );

      hasMoreRef.current = result.hasMore;
      lastMessageRef.current = result.lastMessage;

      return result;
    } catch (error) {
      console.error('Failed to load more messages:', error);
      return { messages: [], hasMore: false };
    } finally {
      loadingRef.current = false;
    }
  }, [conversationId, initialLimit]);

  const reset = useCallback(() => {
    hasMoreRef.current = true;
    lastMessageRef.current = null;
    loadingRef.current = false;
  }, []);

  return {
    loadMore,
    reset,
    hasMore: hasMoreRef.current,
    isLoading: loadingRef.current
  };
};
