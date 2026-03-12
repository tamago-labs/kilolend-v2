/**
 * Markets Store (Zustand)
 * Global state management for market data across all chains
 * Fetches real data from blockchain contracts and auto-refreshes every 60 seconds
 */

import { create } from 'zustand';
import type { Market } from '../hooks/useMarkets';
import type { MarketData } from '../hooks/useMarketsData';

// Re-export MarketData for convenience
export type { MarketData };

// Extended type that includes chainId for components that need chain context
export interface MarketDataWithChain extends MarketData {
  chainId: number;
}
import { fetchMarketData } from '../hooks/useMarketsData';
import { fetchMarketBasicInfo } from '../hooks/useMarketContract';
import { fetchTokenInfo } from '../hooks/useTokenInfo';
import { NATIVE_TOKENS } from '../contracts/config';

export interface MarketsState {
  // Markets data: chainId -> marketAddress -> MarketData
  marketsData: Record<number, Record<string, MarketData>>;
  
  // Markets list per chain: chainId -> Market[]
  markets: Record<number, Market[]>;
  
  // Loading state per chain
  isLoading: Record<number, boolean>;
  
  // Error state per chain
  errors: Record<number, string | null>;
  
  // Last fetch timestamp per chain
  lastFetch: Record<number, number>;
  
  // Whether data has been fetched at least once per chain
  hasFetched: Record<number, boolean>;
  
  // Auto-refresh interval reference
  refreshInterval: NodeJS.Timeout | null;
  
  // Chains being tracked for auto-refresh
  trackedChains: Set<number>;
  
  // Fetch market data for all markets in a chain from market addresses
  fetchMarketsDataFromAddresses: (chainId: number, marketAddresses: `0x${string}`[]) => Promise<void>;
  
  // Fetch market data for all markets in a chain (deprecated - use fetchMarketsDataFromAddresses)
  fetchMarketsData: (chainId: number, markets: Market[]) => Promise<void>;
  
  // Fetch market data for a specific market
  fetchSingleMarketData: (chainId: number, market: Market) => Promise<void>;
  
  // Start auto-refresh for all tracked chains
  startAutoRefresh: (intervalMs?: number) => void;
  
  // Stop auto-refresh
  stopAutoRefresh: () => void;
  
  // Track a chain for auto-refresh
  trackChain: (chainId: number) => void;
  
  // Untrack a chain from auto-refresh
  untrackChain: (chainId: number) => void;
  
  // Clear error for a specific chain
  clearError: (chainId: number) => void;
  
  // Clear all data
  clearAll: () => void;
  
  // Clear data for a specific chain
  clearChain: (chainId: number) => void;
}

export const useMarketsStore = create<MarketsState>((set, get) => ({
  marketsData: {},
  markets: {},
  isLoading: {},
  errors: {},
  lastFetch: {},
  hasFetched: {},
  refreshInterval: null,
  trackedChains: new Set(),
  
  fetchMarketsDataFromAddresses: async (chainId: number, marketAddresses: `0x${string}`[]) => {
    set((state) => ({
      isLoading: { ...state.isLoading, [chainId]: true },
      errors: { ...state.errors, [chainId]: null },
    }));
    
    try {
      // Fetch complete data for all markets in parallel
      const marketDataPromises = marketAddresses.map(async (marketAddress) => {
        // Step 1: Fetch cToken basic info
        const basicInfo = await fetchMarketBasicInfo(marketAddress, chainId);
        if (!basicInfo) return null;

        // Step 2: Get token info (use native config for native tokens)
        let tokenInfo;
        if (basicInfo.isNative) {
          // Use native token configuration
          const nativeConfig = NATIVE_TOKENS[chainId] || NATIVE_TOKENS[96];
          tokenInfo = {
            symbol: basicInfo.symbol.replace('c', ''), // Remove 'c' prefix
            name: nativeConfig.name,
            decimals: nativeConfig.decimals,
          };
        } else {
          // Fetch underlying token info for ERC-20 tokens
          tokenInfo = await fetchTokenInfo(basicInfo.underlying, chainId);
          if (!tokenInfo) return null;
        }

        // Step 3: Build Market object
        const market: Market = {
          address: marketAddress,
          underlying: basicInfo.underlying,
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          decimals: tokenInfo.decimals,
        };

        // Step 4: Fetch market data (rates, stats)
        const marketData = await fetchMarketData(market, chainId);
        return marketData;
      });
      
      const results = await Promise.all(marketDataPromises);
      
      // Build the markets data map and markets list
      const newMarketsData: Record<string, MarketData> = {};
      const newMarkets: Market[] = [];
      let successCount = 0;
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result) {
          newMarketsData[result.address] = result;
          newMarkets.push({
            address: result.address,
            underlying: result.underlying,
            symbol: result.symbol,
            name: result.name,
            decimals: result.decimals,
          });
          successCount++;
        }
      }
      
      if (successCount === 0) {
        throw new Error('Failed to fetch any market data');
      }
      
      set((state) => ({
        marketsData: {
          ...state.marketsData,
          [chainId]: newMarketsData,
        },
        markets: {
          ...state.markets,
          [chainId]: newMarkets,
        },
        isLoading: { ...state.isLoading, [chainId]: false },
        errors: { ...state.errors, [chainId]: null },
        lastFetch: { ...state.lastFetch, [chainId]: Date.now() },
        hasFetched: { ...state.hasFetched, [chainId]: true },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      set((state) => ({
        isLoading: { ...state.isLoading, [chainId]: false },
        errors: { ...state.errors, [chainId]: errorMessage },
      }));
    }
  },

  fetchMarketsData: async (chainId: number, markets: Market[]) => {
    // Deprecated - use fetchMarketsDataFromAddresses for new implementations
    set((state) => ({
      isLoading: { ...state.isLoading, [chainId]: true },
      errors: { ...state.errors, [chainId]: null },
    }));
    
    try {
      // Fetch data for all markets in parallel
      const marketDataPromises = markets.map((market) =>
        fetchMarketData(market, chainId)
      );
      
      const results = await Promise.all(marketDataPromises);
      
      // Build the markets data map
      const newMarketsData: Record<string, MarketData> = {};
      let successCount = 0;
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result) {
          newMarketsData[markets[i].address] = result;
          successCount++;
        }
      }
      
      if (successCount === 0) {
        throw new Error('Failed to fetch any market data');
      }
      
      set((state) => ({
        marketsData: {
          ...state.marketsData,
          [chainId]: newMarketsData,
        },
        markets: {
          ...state.markets,
          [chainId]: markets,
        },
        isLoading: { ...state.isLoading, [chainId]: false },
        errors: { ...state.errors, [chainId]: null },
        lastFetch: { ...state.lastFetch, [chainId]: Date.now() },
        hasFetched: { ...state.hasFetched, [chainId]: true },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      set((state) => ({
        isLoading: { ...state.isLoading, [chainId]: false },
        errors: { ...state.errors, [chainId]: errorMessage },
      }));
    }
  },
  
  fetchSingleMarketData: async (chainId: number, market: Market) => {
    try {
      const marketData = await fetchMarketData(market, chainId);
      
      if (marketData) {
        set((state) => ({
          marketsData: {
            ...state.marketsData,
            [chainId]: {
              ...(state.marketsData[chainId] || {}),
              [market.address]: marketData,
            },
          },
          lastFetch: { ...state.lastFetch, [chainId]: Date.now() },
        }));
      }
    } catch (err) {
      console.error(`Error fetching market data for ${market.symbol}:`, err);
    }
  },
  
  startAutoRefresh: (intervalMs: number = 60_000) => {
    const state = get();
    
    // Clear existing interval if any
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
    }
    
    // Set up new interval
    const interval = setInterval(async () => {
      const currentState = get();
      const { trackedChains, markets } = currentState;
      
      // Refresh all tracked chains
      for (const chainId of trackedChains) {
        const chainMarkets = markets[chainId];
        if (chainMarkets && chainMarkets.length > 0) {
          await currentState.fetchMarketsData(chainId, chainMarkets);
        }
      }
    }, intervalMs);
    
    set({ refreshInterval: interval });
  },
  
  stopAutoRefresh: () => {
    const state = get();
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
      set({ refreshInterval: null });
    }
  },
  
  trackChain: (chainId: number) => {
    set((state) => {
      const newTrackedChains = new Set(state.trackedChains);
      newTrackedChains.add(chainId);
      return { trackedChains: newTrackedChains };
    });
  },
  
  untrackChain: (chainId: number) => {
    set((state) => {
      const newTrackedChains = new Set(state.trackedChains);
      newTrackedChains.delete(chainId);
      return { trackedChains: newTrackedChains };
    });
  },
  
  clearError: (chainId: number) => {
    set((state) => ({
      errors: { ...state.errors, [chainId]: null },
    }));
  },
  
  clearAll: () => {
    get().stopAutoRefresh();
    set({
      marketsData: {},
      markets: {},
      isLoading: {},
      errors: {},
      lastFetch: {},
      hasFetched: {},
      trackedChains: new Set(),
    });
  },
  
  clearChain: (chainId: number) => {
    set((state) => {
      const newState = {
        marketsData: { ...state.marketsData },
        markets: { ...state.markets },
        isLoading: { ...state.isLoading },
        errors: { ...state.errors },
        lastFetch: { ...state.lastFetch },
        hasFetched: { ...state.hasFetched },
      };
      
      delete newState.marketsData[chainId];
      delete newState.markets[chainId];
      delete newState.isLoading[chainId];
      delete newState.errors[chainId];
      delete newState.lastFetch[chainId];
      delete newState.hasFetched[chainId];
      
      const newTrackedChains = new Set(state.trackedChains);
      newTrackedChains.delete(chainId);
      
      return { ...newState, trackedChains: newTrackedChains };
    });
  },
}));

// Selectors for convenient data access
export const selectMarketsData = (state: MarketsState, chainId: number) => 
  state.marketsData[chainId] || {};

export const selectMarkets = (state: MarketsState, chainId: number) => 
  state.markets[chainId] || [];

export const selectMarketsArray = (state: MarketsState, chainId: number): MarketData[] => 
  Object.values(state.marketsData[chainId] || {});

export const selectIsLoading = (state: MarketsState, chainId: number) => 
  state.isLoading[chainId] || false;

export const selectError = (state: MarketsState, chainId: number) => 
  state.errors[chainId] || null;

export const selectHasFetched = (state: MarketsState, chainId: number) => 
  state.hasFetched[chainId] || false;

// Selector to get all markets across all chains
export const selectAllMarketsArray = (state: MarketsState): MarketData[] => {
  const allMarkets: MarketData[] = [];
  for (const chainId in state.marketsData) {
    const chainMarkets = Object.values(state.marketsData[chainId] || {});
    allMarkets.push(...chainMarkets);
  }
  return allMarkets;
};

// Selector to get all markets across all chains with chainId included
export const selectAllMarketsWithChain = (state: MarketsState): MarketDataWithChain[] => {
  const allMarkets: MarketDataWithChain[] = [];
  for (const chainId in state.marketsData) {
    const chainMarkets = Object.values(state.marketsData[chainId] || {});
    allMarkets.push(
      ...chainMarkets.map(m => ({ ...m, chainId: parseInt(chainId) }))
    );
  }
  return allMarkets;
};
