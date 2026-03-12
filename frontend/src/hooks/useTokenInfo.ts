import { useReadContract } from 'wagmi';
import { parseAbi, type Address, createPublicClient, http, type Chain } from 'viem';
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
 * Standard ERC-20 ABI
 */
const ERC20_ABI = parseAbi([
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
]);

/**
 * Token information from ERC-20 contract
 */
export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Hook to fetch ERC-20 token information
 * @param tokenAddress - The address of the ERC-20 token contract
 * @returns Token information (symbol, name, decimals)
 */
export function useTokenInfo(tokenAddress: Address | undefined) {
  const { data: symbol, isLoading: symbolLoading, error: symbolError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
      staleTime: 300_000, // 5 minutes - token info rarely changes
    },
  });

  const { data: name, isLoading: nameLoading, error: nameError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'name',
    query: {
      enabled: !!tokenAddress,
      staleTime: 300_000, // 5 minutes
    },
  });

  const { data: decimals, isLoading: decimalsLoading, error: decimalsError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
      staleTime: 300_000, // 5 minutes
    },
  });

  const isLoading = symbolLoading || nameLoading || decimalsLoading;
  const error = symbolError || nameError || decimalsError;

  const tokenInfo: TokenInfo | undefined = 
    symbol && name && decimals !== undefined
      ? { symbol, name, decimals }
      : undefined;

  return {
    token: tokenInfo,
    isLoading,
    error,
  };
}

/**
 * Fetch ERC-20 token information (standalone function)
 * This can be used outside of React components (e.g., in Zustand store)
 */
export async function fetchTokenInfo(
  tokenAddress: Address,
  chainId: number
): Promise<TokenInfo | null> {
  try {
    const client = getPublicClientForChain(chainId);

    const [symbol, name, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);

    return {
      symbol: symbol as string,
      name: name as string,
      decimals: decimals as number,
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}
