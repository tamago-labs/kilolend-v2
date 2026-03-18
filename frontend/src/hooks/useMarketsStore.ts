/**
 * useMarkets Hook
 * Convenient hooks for accessing markets from the store
 */

import { useEffect } from 'react';
import { useMarketsStore, type MarketsState } from '../store/markets';

/**
 * Main hook to access all markets from the store
 * Automatically fetches markets on first use (all chains)
 * 
 * @example
 * const { allMarkets, marketsByChain, isLoading, error, fetchAllMarkets } = useMarkets();
 * const allMarketsList = allMarkets; // All markets across all chains
 * const kubChainMarkets = marketsByChain[96]; // BitKUB chain markets
 */
export function useMarkets(): MarketsState & {
  initializeMarkets: () => Promise<void>;
} {
  const store = useMarketsStore();
  
  // Fetch markets on first use (only once)
  useEffect(() => {
    if (!store.hasFetched && !store.isLoading) {
      store.fetchAllMarkets();
    }
  }, [store.hasFetched, store.isLoading]);
  
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
  return useMarketsStore((state) => state.getChainMarkets(chainId));
}

/**
 * Check if markets are loading
 */
export function useMarketsLoading(): boolean {
  return useMarketsStore((state) => state.isLoading);
}

/**
 * Get market error message
 */
export function useMarketsError(): string | null {
  return useMarketsStore((state) => state.error);
}

/**
 * Manually refresh all markets
 */
export function useRefreshMarkets(): () => Promise<void> {
  return useMarketsStore((state) => state.fetchAllMarkets);
}

/**
 * Manually refresh markets for a specific chain
 */
export function useRefreshChainMarkets(): (chainId: number) => Promise<void> {
  return useMarketsStore((state) => state.fetchChainMarkets);
}