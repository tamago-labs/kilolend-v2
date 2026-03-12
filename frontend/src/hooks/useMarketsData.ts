import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import type { Market } from './useMarkets';

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

  // const rate = Number(ratePerBlock) / 1e18;
  // const apy = Math.pow(1 + rate, blocksPerYear) - 1;

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
  42793: 1,    // Etherlink
  8217: 2,     // Klaytn/Kaia
};

function getBlocksPerYear(chainId?: number): number {
  const blockTime = chainId ? BLOCK_TIMES[chainId] : 2;
  return Math.floor((365 * 24 * 60 * 60) / blockTime);
}

/**
 * Hook to get complete market data for a single market
 */
export function useMarketData(market: Market | undefined, chainId?: number) {

  const { data: supplyRate, isLoading: supplyRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'supplyRatePerBlock',
    query: {
      enabled: !!market,
      staleTime: 60_000, // 1 minute
    },
  });


  const { data: borrowRate, isLoading: borrowRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'borrowRatePerBlock',
    query: {
      enabled: !!market,
      staleTime: 60_000, // 1 minute
    },
  });

  const { data: exchangeRate, isLoading: exchangeRateLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'exchangeRateStored',
    query: {
      enabled: !!market,
      staleTime: 60_000, // 1 minute
    },
  });

  const { data: cash, isLoading: cashLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'getCash',
    query: {
      enabled: !!market,
      staleTime: 30_000, // 30 seconds
    },
  });

  const { data: totalBorrows, isLoading: totalBorrowsLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'totalBorrows',
    query: {
      enabled: !!market,
      staleTime: 30_000, // 30 seconds
    },
  });

  const { data: totalSupply, isLoading: totalSupplyLoading } = useReadContract({
    address: market?.address,
    abi: MARKET_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!market,
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
      BigInt(10 ** 18)

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