import { useReadContract } from 'wagmi';
import { parseAbi, type Address } from 'viem';

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