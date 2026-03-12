import { useReadContract } from 'wagmi';
import { COMPTROLLER_ADDRESSES } from '../contracts/config';
import comptrollerAbi from '../contracts/abis/comptroller.json';

/**
 * Hook to interact with the Comptroller contract
 * Fetches all markets dynamically from the Comptroller
 */
export function useComptrollerContract(chainId: number | undefined) {
  // Get Comptroller address for the current chain
  const comptrollerAddress = chainId ? COMPTROLLER_ADDRESSES[chainId] : undefined;

  // Fetch all markets from Comptroller
  const { data: markets, isLoading, error, refetch } = useReadContract({
    address: comptrollerAddress as `0x${string}`,
    abi: comptrollerAbi,
    functionName: 'getAllMarkets',
    query: {
      enabled: !!comptrollerAddress && !!chainId,
      staleTime: 60_000, // Cache for 1 minute
      retry: 3,
    },
  });

  return {
    markets: markets as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
    comptrollerAddress,
  };
}

/**
 * Hook to get markets in which a user has positions
 */
export function useUserMarkets(chainId: number | undefined, userAddress?: `0x${string}`) {
  const comptrollerAddress = chainId ? COMPTROLLER_ADDRESSES[chainId] : undefined;

  const { data: userMarkets, isLoading, error } = useReadContract({
    address: comptrollerAddress as `0x${string}`,
    abi: comptrollerAbi,
    functionName: 'getAssetsIn',
    args: [userAddress],
    query: {
      enabled: !!comptrollerAddress && !!chainId && !!userAddress,
      staleTime: 30_000, // Cache for 30 seconds
    },
  });

  return {
    userMarkets: userMarkets as `0x${string}`[] | undefined,
    isLoading,
    error,
  };
}