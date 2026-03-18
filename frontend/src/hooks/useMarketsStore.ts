/**
 * useMarkets Hook
 * Convenient hooks for accessing markets from the store
 */

import { useEffect, useRef } from 'react';
import { useMarketsStore as useMarketsStoreBase, type MarketsState } from '../store/markets';

/**
 * Main hook to access all markets from the store
 * Automatically fetches markets on first use (all chains)
 * 
 * @example
 * const { allMarkets, marketsByChain, isLoading, error, fetchAllMarkets } = useMarketsData();
 * const allMarketsList = allMarkets; // All markets across all chains
 * const kubChainMarkets = marketsByChain[96]; // BitKUB chain markets
 */
export function useMarketsData(): MarketsState & {
  initializeMarkets: () => Promise<void>;
} {
  const store = useMarketsStoreBase();
  const isInitializing = useRef(false);
  
  // Fetch markets on first use (only once, with guard to prevent race conditions)
  useEffect(() => {
    // Double-check: only fetch if not already fetched, not loading, and not already initializing
    if (!store.hasFetched && !store.isLoading && !isInitializing.current) {
      isInitializing.current = true;
      store.fetchAllMarkets();
    }
  }, [store.hasFetched, store.isLoading, store.fetchAllMarkets]);
  
  return {
    ...store,
    initializeMarkets: store.fetchAllMarkets,
  };
}

/**
 * Get markets for a specific chain
 * 
 * @param chainId - Chain ID (e.g., 96, 42793, 8217, 42220)
 * @returns Array of MarketData for the specified chain
 * 
 * @example
 * const kubChainMarkets = useChainMarkets(96); // BitKUB chain markets
 * const kaiaMarkets = useChainMarkets(8217); // KAIA chain markets
 */
export function useChainMarkets(chainId: number) {
  return useMarketsStoreBase((state) => state.getChainMarkets(chainId));
}

/**
 * Check if markets are loading
 */
export function useMarketsLoading(): boolean {
  return useMarketsStoreBase((state) => state.isLoading);
}

/**
 * Get market error message
 */
export function useMarketsError(): string | null {
  return useMarketsStoreBase((state) => state.error);
}

/**
 * Manually refresh all markets
 */
export function useRefreshMarkets(): () => Promise<void> {
  return useMarketsStoreBase((state) => state.fetchAllMarkets);
}

/**
 * Manually refresh markets for a specific chain
 */
export function useRefreshChainMarkets(): (chainId: number) => Promise<void> {
  return useMarketsStoreBase((state) => state.fetchChainMarkets);
}