/**
 * Hook to initialize markets for a specific chain
 * Uses useMarkets to get market addresses from Comptroller
 * Then fetches complete market data and stores it in the Zustand store
 * Also tracks the chain for auto-refresh
 */

import { useEffect, useRef } from 'react';
import { useMarkets } from './useMarkets';
import { useMarketsStore } from '../store/markets';
import type { Market } from './useMarkets';

interface UseInitializeMarketsOptions {
  /**
   * Whether to start auto-refresh after initial fetch
   * @default true
   */
  enableAutoRefresh?: boolean;
  
  /**
   * Auto-refresh interval in milliseconds
   * @default 60000 (60 seconds)
   */
  refreshInterval?: number;
  
  /**
   * Whether to track this chain for auto-refresh
   * @default true
   */
  trackChain?: boolean;
}

/**
 * Hook to initialize markets for a chain and store data in Zustand
 * 
 * @param chainId - The chain ID to initialize markets for
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * useInitializeMarkets(8217); // Kaia chain with defaults
 * 
 * // With custom options
 * useInitializeMarkets(8217, {
 *   enableAutoRefresh: true,
 *   refreshInterval: 30000, // 30 seconds
 *   trackChain: true,
 * });
 * ```
 */
export function useInitializeMarkets(
  chainId: number | undefined,
  options: UseInitializeMarketsOptions = {}
) {
  const {
    enableAutoRefresh = true,
    refreshInterval = 60_000,
    trackChain = true,
  } = options;
  
  const { markets, isLoading: marketsLoading, error: marketsError } = useMarkets(chainId);
  const {
    fetchMarketsDataFromAddresses,
    startAutoRefresh,
    trackChain: addToTrackedChains,
    hasFetched: storeHasFetched,
  } = useMarketsStore();
  
  // Get loading state from store (must be called at top level)
  const isLoading = useMarketsStore((state) => chainId ? (state.isLoading[chainId] || false) : false);
  
  // Get error state from store (must be called at top level)
  const error = useMarketsStore((state) => chainId ? (state.errors[chainId] || null) : null);
  
  const hasInitialized = useRef(false);
  const autoRefreshStarted = useRef(false);
  
  useEffect(() => {
    // Skip if chainId is not provided
    if (!chainId) {
      console.log(`[useInitializeMarkets] No chainId provided`);
      return;
    }
    
    console.log(`[useInitializeMarkets] Chain ${chainId}:`, {
      marketsLoading,
      marketsError: marketsError?.message,
      marketsCount: markets?.length || 0,
      hasInitialized: hasInitialized.current,
      hasFetched: storeHasFetched[chainId],
    });
    
    // Skip if markets are still loading
    if (marketsLoading) {
      console.log(`[useInitializeMarkets] Chain ${chainId}: Still loading markets from Comptroller`);
      return;
    }
    
    // Skip if markets failed to load
    if (marketsError) {
      console.error(`[useInitializeMarkets] Chain ${chainId}: Failed to load markets -`, marketsError);
      return;
    }
    
    // Skip if no markets available
    if (!markets || markets.length === 0) {
      console.log(`[useInitializeMarkets] Chain ${chainId}: No markets available`);
      return;
    }
    
    // Skip if already initialized and data has been fetched
    if (hasInitialized.current && storeHasFetched[chainId]) {
      console.log(`[useInitializeMarkets] Chain ${chainId}: Already initialized and fetched`);
      return;
    }
    
    // Track chain for auto-refresh if enabled
    if (trackChain) {
      console.log(`[useInitializeMarkets] Chain ${chainId}: Tracking for auto-refresh`);
      addToTrackedChains(chainId);
    }
    
    // Fetch market data from addresses (includes basic info, token info, rates, stats)
    console.log(`[useInitializeMarkets] Chain ${chainId}: Fetching data for ${markets.length} markets`);
    fetchMarketsDataFromAddresses(chainId, markets);
    
    hasInitialized.current = true;
  }, [
    chainId,
    markets,
    marketsLoading,
    marketsError,
    fetchMarketsDataFromAddresses,
    trackChain,
    addToTrackedChains,
    storeHasFetched,
  ]);
  
  // Start auto-refresh on mount if enabled
  useEffect(() => {
    if (!enableAutoRefresh || autoRefreshStarted.current) {
      return;
    }
    
    startAutoRefresh(refreshInterval);
    autoRefreshStarted.current = true;
    
    // Cleanup on unmount
    return () => {
      // Note: We don't stop auto-refresh here as it might be used by other chains
      // You can call useMarketsStore.getState().stopAutoRefresh() explicitly if needed
    };
  }, [enableAutoRefresh, refreshInterval, startAutoRefresh]);
  
  return {
    isLoading: marketsLoading || isLoading,
    error: marketsError || error,
    hasFetched: chainId ? (storeHasFetched[chainId] || false) : false,
  };
}

/**
 * Hook to initialize markets for multiple chains
 * 
 * @param chainIds - Array of chain IDs to initialize (up to 4 chains supported)
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * useInitializeMultiChain([8217, 96, 42793, 42220]);
 * ```
 * 
 * Note: Due to React's Rules of Hooks, we use a fixed-length array approach
 * to ensure hooks are called in the same order on every render.
 */
export function useInitializeMultiChain(
  chainIds: number[],
  options: UseInitializeMarketsOptions = {}
) {
  // Call hooks in fixed order regardless of array length
  // This ensures hooks are always called in the same order
  const chain1 = useInitializeMarkets(chainIds[0], options);
  const chain2 = useInitializeMarkets(chainIds[1], options);
  const chain3 = useInitializeMarkets(chainIds[2], options);
  const chain4 = useInitializeMarkets(chainIds[3], options);
  
  // Filter out undefined results for chains that weren't provided
  const results = [chain1, chain2, chain3, chain4].filter(Boolean);
  
  return results;
}
