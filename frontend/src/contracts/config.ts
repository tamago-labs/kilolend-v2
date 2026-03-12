/**
 * KiloLend Contract Configuration
 * Maps chain IDs to their respective Comptroller addresses
 */

/**
 * Native token information by chain
 */
export const NATIVE_TOKENS: Record<number, { symbol: string; name: string; decimals: number }> = {
  96: { symbol: 'KUB', name: 'KUB Coin', decimals: 18 },      // BitKUB Chain
  42793: { symbol: 'XTZ', name: 'Tezos', decimals: 18 },          // Etherlink
  8217: { symbol: 'KAIA', name: 'KAIA', decimals: 18 },        // Klaytn/Kaia
} as const;

export const COMPTROLLER_ADDRESSES: Record<number, string> = {
  96: '0x42f098E6aE5e81f357D3fD6e104BAA77A195133A',   // BitKUB Chain
  42793: '0x42f098E6aE5e81f357D3fD6e104BAA77A195133A',  // Etherlink
  8217: '0x2591d179a0B1dB1c804210E111035a3a13c95a48', // Klaytn/Kaia
  // 42220: // Celo - TODO: Add Comptroller address when deployed
} as const;

export type ChainId = keyof typeof COMPTROLLER_ADDRESSES;

/**
 * Get Comptroller address for a specific chain
 * @throws Error if chain is not supported
 */
export function getComptrollerAddress(chainId: number): string {
  const address = COMPTROLLER_ADDRESSES[chainId as number];
  if (!address) {
    throw new Error(`No Comptroller address configured for chain ${chainId}`);
  }
  return address;
}