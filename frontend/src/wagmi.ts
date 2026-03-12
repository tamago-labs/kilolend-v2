import { getDefaultConfig } from '@rainbow-me/rainbowkit'; 
import { kaia, etherlink, celo } from 'wagmi/chains';
import { defineChain } from 'viem';

export { kaia, etherlink, celo };

export const kubChain = defineChain({
  id: 96,
  name: 'KUB Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'KUB',
    symbol: 'KUB',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bitkubchain.io'] },
  },
  blockExplorers: {
    default: { name: 'KUB Explorer', url: 'https://www.kubscan.com/' },
  },
  testnet: false,
})


export const config = getDefaultConfig({
  appName: 'KiloLend v2',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    kaia,
    etherlink,
    kubChain,
    celo
  ],
});
