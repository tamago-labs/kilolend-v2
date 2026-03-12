import { useReadContract } from 'wagmi';
import cTokenAbi from '../contracts/abis/cToken.json';

/**
 * Types for market data
 */
export interface MarketBasicInfo {
  underlying: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  isNative?: boolean; // Indicates if this is a native token market (no underlying ERC-20)
}

export interface MarketRates {
  supplyRatePerBlock: bigint;
  borrowRatePerBlock: bigint;
  exchangeRateStored: bigint;
}

export interface MarketStats {
  cash: bigint;
  totalBorrows: bigint;
  totalReserves: bigint;
  totalSupply: bigint;
}

export interface UserMarketData {
  balanceOf: bigint;
  borrowBalanceStored: bigint;
}

/**
 * Hook to get basic market information (underlying, symbol, name, decimals)
 * Handles both ERC-20 tokens and native tokens (ETH, KUB, KLAY, etc.)
 */
export function useMarketBasicInfo(marketAddress: `0x${string}` | undefined) {
  // Try to get underlying address - if it fails, this is a native token market
  const { data, isLoading, error } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'underlying',
    query: {
      enabled: !!marketAddress,
      staleTime: 300_000, // Cache for 5 minutes
      retry: false, // Don't retry on failure (native tokens don't have this function)
    },
  });

  const { data: symbol } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'symbol',
    query: {
      enabled: !!marketAddress,
      staleTime: 300_000,
    },
  });

  const { data: name } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'name',
    query: {
      enabled: !!marketAddress,
      staleTime: 300_000,
    },
  });

  const { data: decimals } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'decimals',
    query: {
      enabled: !!marketAddress,
      staleTime: 300_000,
    },
  });

  // Native token markets don't have an underlying() function
  const isNative = !data && !isLoading;

  return {
    data: symbol && name && decimals !== undefined
      ? {
          underlying: isNative 
            ? '0x0000000000000000000000000000000000000000' as `0x${string}` // Zero address for native
            : (data as `0x${string}`),
          symbol: symbol as string,
          name: name as string,
          decimals: decimals as number,
          isNative,
        }
      : undefined,
    isLoading: isLoading || !symbol || !name || decimals === undefined,
    error: isNative ? undefined : error, // Don't report error for native tokens
  };
}

/**
 * Hook to get market rates (supply, borrow, exchange rate)
 */
export function useMarketRates(marketAddress: `0x${string}` | undefined) {
  const { data: supplyRatePerBlock } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'supplyRatePerBlock',
    query: {
      enabled: !!marketAddress,
      staleTime: 60_000, // Cache for 1 minute
    },
  });

  const { data: borrowRatePerBlock } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'borrowRatePerBlock',
    query: {
      enabled: !!marketAddress,
      staleTime: 60_000,
    },
  });

  const { data: exchangeRateStored } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'exchangeRateStored',
    query: {
      enabled: !!marketAddress,
      staleTime: 60_000,
    },
  });

  return {
    data: supplyRatePerBlock && borrowRatePerBlock && exchangeRateStored
      ? {
          supplyRatePerBlock: supplyRatePerBlock as bigint,
          borrowRatePerBlock: borrowRatePerBlock as bigint,
          exchangeRateStored: exchangeRateStored as bigint,
        }
      : undefined,
    isLoading: !supplyRatePerBlock || !borrowRatePerBlock || !exchangeRateStored,
  };
}

/**
 * Hook to get market statistics (cash, borrows, reserves, supply)
 */
export function useMarketStats(marketAddress: `0x${string}` | undefined) {
  const { data: cash } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'getCash',
    query: {
      enabled: !!marketAddress,
      staleTime: 30_000, // Cache for 30 seconds
    },
  });

  const { data: totalBorrows } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'totalBorrows',
    query: {
      enabled: !!marketAddress,
      staleTime: 30_000,
    },
  });

  const { data: totalReserves } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'totalReserves',
    query: {
      enabled: !!marketAddress,
      staleTime: 30_000,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'totalSupply',
    query: {
      enabled: !!marketAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: cash !== undefined && totalBorrows !== undefined && totalReserves !== undefined && totalSupply !== undefined
      ? {
          cash: cash as bigint,
          totalBorrows: totalBorrows as bigint,
          totalReserves: totalReserves as bigint,
          totalSupply: totalSupply as bigint,
        }
      : undefined,
    isLoading: cash === undefined || totalBorrows === undefined || totalReserves === undefined || totalSupply === undefined,
  };
}

/**
 * Hook to get user's market data (balance, borrow balance)
 */
export function useUserMarketData(marketAddress: `0x${string}` | undefined, userAddress?: `0x${string}`) {
  const { data: balanceOf } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!marketAddress && !!userAddress,
      staleTime: 30_000,
    },
  });

  const { data: borrowBalanceStored } = useReadContract({
    address: marketAddress,
    abi: cTokenAbi,
    functionName: 'borrowBalanceStored',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!marketAddress && !!userAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: balanceOf !== undefined && borrowBalanceStored !== undefined
      ? {
          balanceOf: balanceOf as bigint,
          borrowBalanceStored: borrowBalanceStored as bigint,
        }
      : undefined,
    isLoading: balanceOf === undefined || borrowBalanceStored === undefined,
  };
}