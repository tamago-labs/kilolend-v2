import { useReadContract } from 'wagmi';
import { COMPTROLLER_ADDRESSES } from '../contracts/config';
import comptrollerAbi from '../contracts/abis/comptroller.json';
import { createPublicClient, http, type Chain } from 'viem';
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
 * Hook to interact with the Comptroller contract
 * Fetches all markets dynamically from the Comptroller
 */
export function useComptrollerContract(chainId: number | undefined) {
  // Get Comptroller address for the current chain
  const comptrollerAddress = chainId ? COMPTROLLER_ADDRESSES[chainId] : undefined;

  // Check if the chain has a valid comptroller address configured
  // Note: Having an address doesn't guarantee the contract exists or has the function
  const hasValidConfig = !!comptrollerAddress && !!chainId;

  // Fetch all markets from Comptroller
  const { data: markets, isLoading, error, refetch } = useReadContract({
    address: comptrollerAddress as `0x${string}`,
    abi: comptrollerAbi,
    functionName: 'getAllMarkets',
    chainId,
    query: {
      enabled: hasValidConfig,
      staleTime: 60_000, // Cache for 1 minute
      retry: 3,
    },
  });

  return {
    markets: markets as `0x${string}`[] | undefined,
    isLoading: hasValidConfig ? isLoading : false,
    error: hasValidConfig ? error : null,
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
    chainId,
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

/**
 * Fetch all markets from Comptroller (standalone function)
 * This can be used outside of React components (e.g., in Zustand store)
 */
export async function fetchMarketsFromComptroller(
  chainId: number
): Promise<`0x${string}`[] | null> {
  try {
    const comptrollerAddress = COMPTROLLER_ADDRESSES[chainId];
    if (!comptrollerAddress) {
      throw new Error(`No Comptroller address configured for chain ${chainId}`);
    }

    const client = getPublicClientForChain(chainId);

    const markets = await client.readContract({
      address: comptrollerAddress as `0x${string}`,
      abi: comptrollerAbi,
      functionName: 'getAllMarkets',
    }) as `0x${string}`[];

    return markets;
  } catch (error) {
    console.error(`Error fetching markets from Comptroller for chain ${chainId}:`, error);
    return null;
  }
}
