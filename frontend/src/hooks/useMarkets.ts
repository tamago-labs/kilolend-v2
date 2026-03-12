import { useComptrollerContract } from './useComptrollerContract';

/**
 * Combined market type with basic info
 */
export interface Market {
  address: `0x${string}`;
  underlying: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Hook to get all market addresses from Comptroller
 * This just returns the list of market addresses without fetching their details
 * Use individual hooks like useMarketBasicInfo, useMarketData for specific markets
 */
export function useMarkets(chainId: number | undefined) {
  const { markets, isLoading, error, refetch } = useComptrollerContract(chainId);

  return {
    markets,
    isLoading,
    error,
    refetch,
  };
}
