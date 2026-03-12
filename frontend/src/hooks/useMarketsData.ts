import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { parseAbi, createPublicClient, http, type Chain } from 'viem';
import type { Market } from './useMarkets';
import { kaia, etherlink, kubChain, celo } from '../wagmi';

// Map chain IDs to their viem chain configs
const chainMap: Record<number, Chain> = {
  8217: kaia,
  42793: etherlink,
  96: kubChain,
  42220: celo,
};

function getPublicClientForChain(chainId: number) {
  const chain = chainMap[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  // Use the chain's default RPC URL
  const rpcUrl = chain.rpcUrls.default.http[0];
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

/**
 * Complete market data including rates and statistics
 */
export interface MarketData extends Market {
  rates: {
    supplyRatePerBlock: bigint;
    borrowRatePerBlock: bigint;
    exchangeRateStored: bigint;
    supplyApy: number;
    borrowApy: number;
  };
  stats: {
    cash: bigint;
    totalBorrows: bigint;
    totalReserves: bigint;
    totalSupply: bigint;
    availableLiquidity: bigint;
    utilizationRate: number;
  };
}

const MARKET_ABI = parseAbi([
  'function supplyRatePerBlock() view returns (uint256)',
  'function borrowRatePerBlock() view returns (uint256)',
  'function exchangeRateStored() view returns (uint256)',
  'function getCash() view returns (uint256)',
  'function totalBorrows() view returns (uint256)',
  'function totalReserves() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function underlying() view returns (address)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
]);

/**
 * Convert block rate to APY
 */
function blockRateToApy(ratePerBlock: bigint, blocksPerYear: number): number {
  if (ratePerBlock === 0n) return 0;

  const scale = BigInt(10) ** BigInt(18);

  const apy = Number(
    (BigInt(ratePerBlock) * BigInt(blocksPerYear) * BigInt(10000)) / scale
  ) / 100;

  return apy;
}

/**
 * Block times per chain (seconds per block)
 */
const BLOCK_TIMES: Record<number, number> = {
  96: 5,      // BitKUB
  42793: 1,   // Etherlink
  8217: 2,    // Klaytn/Kaia
  42220: 1,   // Celo
};

function getBlocksPerYear(chainId?: number): number {
  const blockTime = chainId ? BLOCK_TIMES[chainId] : 2;
  return Math.floor((365 * 24 * 60 * 60) / blockTime);
}

/**
 * Fetch market data for a single market (standalone function)
 * This can be used outside of React components (e.g., in Zustand store)
 */
export async function fetchMarketData(
  market: Market,
  chainId: number
): Promise<MarketData | null> {
  try {
    const client = getPublicClientForChain(chainId);
    const blocksPerYear = getBlocksPerYear(chainId);

    const [supplyRate, borrowRate, exchangeRate, cash, totalBorrows, totalSupply] =
      await Promise.all([
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'supplyRatePerBlock',
        }),
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'borrowRatePerBlock',
        }),
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'exchangeRateStored',
        }),
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'getCash',
        }),
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'totalBorrows',
        }),
        client.readContract({
          address: market.address,
          abi: MARKET_ABI,
          functionName: 'totalSupply',
        }),
      ]);

    const supplyApy = blockRateToApy(supplyRate as bigint, blocksPerYear);
    const borrowApy = blockRateToApy(borrowRate as bigint, blocksPerYear);
    const availableLiquidity = cash as bigint;
    const utilizationRate =
      (totalBorrows as bigint) > 0n
        ? Number(totalBorrows as bigint) /
          Number((totalBorrows as bigint) + (cash as bigint))
        : 0;

    const totalSupplyUnderlying =
      (BigInt((totalSupply || 0).toString()) * BigInt(exchangeRate.toString())) /
      BigInt(10 ** 18);

    return {
      ...market,
      rates: {
        supplyRatePerBlock: supplyRate as bigint,
        borrowRatePerBlock: borrowRate as bigint,
        exchangeRateStored: exchangeRate as bigint,
        supplyApy,
        borrowApy,
      },
      stats: {
        cash: cash as bigint,
        totalBorrows: totalBorrows as bigint,
        totalSupply: totalSupplyUnderlying as bigint,
        availableLiquidity,
        utilizationRate,
      },
    } as MarketData;
  } catch (error) {
    console.error(`Error fetching market data for ${market.symbol}:`, error);
    return null;
  }
}

/**
 * Hook to get complete market data for a single market
 */
export function useMarketData(market: Market | undefined, chainId?: number) {
  const { data: supplyRate, isLoading: supplyRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'supplyRatePerBlock',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 60_000, // 1 minute
    },
  });

  const { data: borrowRate, isLoading: borrowRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'borrowRatePerBlock',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 60_000, // 1 minute
    },
  });

  const { data: exchangeRate, isLoading: exchangeRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'exchangeRateStored',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 60_000, // 1 minute
    },
  });

  const { data: cash, isLoading: cashLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'getCash',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 30_000, // 30 seconds
    },
  });

  const { data: totalBorrows, isLoading: totalBorrowsLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'totalBorrows',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 30_000, // 30 seconds
    },
  });

  const { data: totalSupply, isLoading: totalSupplyLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'totalSupply',
    chainId,
    query: {
      enabled: !!market && !!chainId,
      staleTime: 30_000, // 30 seconds
    },
  });

  const blocksPerYear = getBlocksPerYear(chainId);

  const marketData = useMemo(() => {
    if (!market || !borrowRate || !exchangeRate) {
      return undefined;
    }

    const supplyApy = blockRateToApy(supplyRate as bigint, blocksPerYear);
    const borrowApy = blockRateToApy(borrowRate as bigint, blocksPerYear);
    const availableLiquidity = (cash as bigint) as bigint;
    const utilizationRate = totalBorrows && totalBorrows > 0n
      ? Number(totalBorrows as bigint) / Number((totalBorrows as bigint) + (cash as bigint))
      : 0;

    // Calculate total supply in underlying tokens
    const totalSupplyUnderlying =
      (BigInt((totalSupply || 0).toString()) * BigInt(exchangeRate.toString())) /
      BigInt(10 ** 18);

    return {
      ...market,
      rates: {
        supplyRatePerBlock: supplyRate as bigint,
        borrowRatePerBlock: borrowRate as bigint,
        exchangeRateStored: exchangeRate as bigint,
        supplyApy,
        borrowApy,
      },
      stats: {
        cash: cash as bigint,
        totalBorrows: totalBorrows as bigint,
        totalSupply: totalSupplyUnderlying as bigint,
        availableLiquidity,
        utilizationRate,
      },
    } as MarketData;
  }, [market, supplyRate, borrowRate, exchangeRate, cash, totalBorrows, totalSupply, blocksPerYear]);

  const isLoading = supplyRateLoading || borrowRateLoading || exchangeRateLoading ||
    cashLoading || totalBorrowsLoading || totalSupplyLoading;

  return {
    data: marketData,
    isLoading,
  };
}