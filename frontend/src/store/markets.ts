/**
 * Markets Store (Zustand)
 * Global state management for cross-chain market data
 */

import { create } from 'zustand';
import type { MarketData } from '../hooks/useMarketsData';
import { fetchMarketsFromComptroller } from '../hooks/useComptrollerContract';
import { fetchMarketBasicInfo } from '../hooks/useMarketContract';
import { fetchTokenInfo } from '../hooks/useTokenInfo';
import { fetchMarketData } from '../hooks/useMarketsData';
import { NATIVE_TOKENS } from '../contracts/config';

// Supported chains
const SUPPORTED_CHAINS = [96, 42793, 8217, 42220];

/**
 * Markets State Interface
 */
export interface MarketsState {
  // Nested structure: chainId -> marketAddress -> MarketData
  marketsByChain: Record<number, Record<string, MarketData>>;
  
  // Flat list for easy access across all chains
  allMarkets: MarketData[];
  
  // Per-chain loading states
  loadingByChain: Record<number, boolean>;
  
  // Per-chain error states
  errorsByChain: Record<number, string | null>;
  
  // Global loading state
  isLoading: boolean;
  
  // Global error
  error: string | null;
  
  // Whether markets have been fetched at least once
  hasFetched: boolean;
  
  /**
   * Fetch markets from all supported chains
   */
  fetchAllMarkets: () => Promise<void>;
  
  /**
   * Fetch markets from a specific chain
   */
  fetchChainMarkets: (chainId: number) => Promise<void>;
  
  /**
   * Get markets for a specific chain
   */
  getChainMarkets: (chainId: number) => MarketData[];
  
  /**
   * Refresh a specific market
   */
  refreshMarket: (chainId: number, marketAddress: string) => Promise<void>;
  
  /**
   * Clear all error states
   */
  clearErrors: () => void;
}

/**
 * Fetch complete market data for a single market address
 * Follows the 5-step process:
 * 1. Get cToken basic info (includes isNative flag)
 * 2. Check if it's a native token market
 * 3. Get underlying token info (only for non-native tokens)
 * 4. Build market object with correct token info
 * 5. Get market data (rates, stats)
 */
async function fetchCompleteMarketData(
  marketAddress: string,
  chainId: number
): Promise<MarketData | null> {
  try {
    // Step 1: Get cToken basic info (includes isNative flag)
    const cTokenInfo = await fetchMarketBasicInfo(marketAddress as `0x${string}`, chainId);
    if (!cTokenInfo) {
      console.warn(`Failed to fetch basic info for market ${marketAddress} on chain ${chainId}`);
      return null;
    }

    // Step 2: Check if it's a native token market
    const isNative = cTokenInfo.isNative;

    // Step 3: Get underlying token info (only for non-native tokens)
    let underlyingToken = null;
    if (!isNative && cTokenInfo.underlying !== '0x0000000000000000000000000000000000000000') {
      underlyingToken = await fetchTokenInfo(cTokenInfo.underlying, chainId);
    }

    // Step 4: Build market object with correct token info
    if (!isNative && !underlyingToken) {
      console.warn(`Failed to fetch underlying token info for ${marketAddress} on chain ${chainId}`);
      return null;
    }

    const marketObj = {
      address: marketAddress as `0x${string}`,
      underlying: cTokenInfo.underlying,
      // For native tokens, use the cToken info (which is already the native token)
      // For ERC-20 tokens, use the underlying token info
      symbol: isNative
        ? cTokenInfo.symbol.replace('c', '') // Remove 'c' prefix (e.g., "cKUB" -> "KUB")
        : underlyingToken!.symbol,
      name: isNative
        ? NATIVE_TOKENS[chainId]?.name || cTokenInfo.name.replace('Compound ', '') // Use native token name
        : underlyingToken!.name,
      decimals: isNative
        ? NATIVE_TOKENS[chainId]?.decimals || 18 // Use native token decimals
        : underlyingToken!.decimals,
    };

    // Step 5: Get market data (rates, stats)
    const marketData = await fetchMarketData(marketObj, chainId);
    
    return marketData;
  } catch (error) {
    console.error(`Error fetching complete market data for ${marketAddress}:`, error);
    return null;
  }
}

/**
 * Fetch all markets for a specific chain
 */
async function fetchChainMarketsInternal(
  chainId: number,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setMarkets: (markets: Record<string, MarketData>) => void
): Promise<MarketData[]> {
  setLoading(true);
  setError(null);

  try {

    // Get all market addresses from Comptroller
    const marketAddresses = await fetchMarketsFromComptroller(chainId);
    
    if (!marketAddresses || marketAddresses.length === 0) {
      setError(`No markets found for chain ${chainId}`);
      setLoading(false);
      return [];
    }

    // Fetch complete data for each market (parallel)
    const marketDataPromises = marketAddresses.map(async (address) => {
      return await fetchCompleteMarketData(address, chainId);
    });

    const marketResults = await Promise.all(marketDataPromises);

    // Filter out null results and build the markets object
    const successfulMarkets = marketResults.filter((m): m is MarketData => m !== null);
    const marketsMap: Record<string, MarketData> = {};
    
    successfulMarkets.forEach((market) => {
      marketsMap[market.address] = market;
    });

    setMarkets(marketsMap);
    return successfulMarkets;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to fetch markets for chain ${chainId}`;
    setError(errorMessage);
    console.error(`Error fetching markets for chain ${chainId}:`, error);
    return [];
  } finally {
    setLoading(false);
  }
}

/**
 * Helper function to flatten markets from all chains into a single array
 */
function flattenAllMarkets(marketsByChain: Record<number, Record<string, MarketData>>): MarketData[] {
  return Object.values(marketsByChain).flatMap(chainMarkets => 
    Object.values(chainMarkets)
  );
}

export const useMarketsStore = create<MarketsState>((set, get) => ({
  marketsByChain: {},
  allMarkets: [],
  loadingByChain: SUPPORTED_CHAINS.reduce((acc, chainId) => ({ ...acc, [chainId]: false }), {}),
  errorsByChain: SUPPORTED_CHAINS.reduce((acc, chainId) => ({ ...acc, [chainId]: null }), {}),
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchAllMarkets: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch markets from all chains in parallel
      const chainPromises = SUPPORTED_CHAINS.map(async (chainId) => {
        return await fetchChainMarketsInternal(
          chainId,
          (loading) => set((state) => ({
            loadingByChain: { ...state.loadingByChain, [chainId]: loading }
          })),
          (error) => set((state) => ({
            errorsByChain: { ...state.errorsByChain, [chainId]: error }
          })),
          (markets) => set((state) => ({
            marketsByChain: { ...state.marketsByChain, [chainId]: markets }
          }))
        );
      });

      const allChainResults = await Promise.all(chainPromises);

      // Flatten all markets into a single array
      const allMarketsFlat = allChainResults.flat();

      set({
        allMarkets: allMarketsFlat,
        isLoading: false,
        error: null,
        hasFetched: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch markets';
      set({
        isLoading: false,
        error: errorMessage,
        hasFetched: true,
      });
    }
  },

  fetchChainMarkets: async (chainId: number) => {
    const markets = await fetchChainMarketsInternal(
      chainId,
      (loading) => set((state) => ({
        loadingByChain: { ...state.loadingByChain, [chainId]: loading }
      })),
      (error) => set((state) => ({
        errorsByChain: { ...state.errorsByChain, [chainId]: error }
      })),
      (markets) => {
        set((state) => {
          const updatedMarketsByChain = { ...state.marketsByChain, [chainId]: markets };
          // Update allMarkets flat list
          const allMarketsFlat = flattenAllMarkets(updatedMarketsByChain);
          return {
            marketsByChain: updatedMarketsByChain,
            allMarkets: allMarketsFlat,
          };
        });
      }
    );
  },

  getChainMarkets: (chainId: number) => {
    const state = get();
    return Object.values(state.marketsByChain[chainId] || {});
  },

  refreshMarket: async (chainId: number, marketAddress: string) => {
    try {
      const marketData = await fetchCompleteMarketData(marketAddress, chainId);
      
      if (marketData) {
        set((state) => {
          const updatedChainMarkets = {
            ...state.marketsByChain[chainId],
            [marketAddress]: marketData
          };
          const updatedMarketsByChain = {
            ...state.marketsByChain,
            [chainId]: updatedChainMarkets
          };
          // Flatten the nested structure properly
          const allMarketsFlat = flattenAllMarkets(updatedMarketsByChain);
          
          return {
            marketsByChain: updatedMarketsByChain,
            allMarkets: allMarketsFlat,
          };
        });
      }
    } catch (error) {
      console.error(`Error refreshing market ${marketAddress} on chain ${chainId}:`, error);
    }
  },

  clearErrors: () => {
    set({
      error: null,
      errorsByChain: SUPPORTED_CHAINS.reduce((acc, chainId) => ({ ...acc, [chainId]: null }), {}),
    });
  },
}));