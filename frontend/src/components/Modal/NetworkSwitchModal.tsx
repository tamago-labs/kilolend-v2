 
import { useSwitchChain, useChainId } from 'wagmi';
import { BaseModal } from './BaseModal';
import { kaia, etherlink, celo } from 'wagmi/chains';
import { kubChain } from '../../wagmi';

const chains = [
  {
    ...kaia,
    icon: '/images/blockchain-icons/kaia-token-icon.png',
    description: 'KAIA Mainnet'
  },
  {
    ...kubChain,
    icon: '/images/blockchain-icons/kub-chain-icon.png',
    description: 'KUB Mainnet'
  },
  {
    ...celo,
    icon: '/images/blockchain-icons/celo-icon.png',
    description: 'Celo Mainnet'
  },
  {
    ...etherlink,
    icon: '/images/blockchain-icons/etherlink-icon.png',
    description: 'Etherlink Mainnet'
  },
];

export interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkSwitchModal = ({ isOpen, onClose }: NetworkSwitchModalProps) => {
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const handleChainSwitch = (targetChainId: number) => {
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId });
    }
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Switch Network" width="400px">
      <div className="flex flex-col gap-3">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${chain.id === chainId
              ? 'border-2 border-green-500 bg-green-50'
              : 'border-2 border-slate-200 bg-white hover:border-green-500 hover:bg-slate-50'
              }`}
            onClick={() => handleChainSwitch(chain.id)}
          >
            <img
              src={chain.icon}
              alt={chain.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="text-base font-semibold text-slate-800 mb-1">{chain.name}</div>
              <div className="text-sm text-slate-500">{chain.description}</div>
            </div>
            {chain.id === chainId && (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </BaseModal>
  );
};