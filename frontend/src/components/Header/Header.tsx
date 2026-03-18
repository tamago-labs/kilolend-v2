import { useState } from 'react';
import { Clock, ChevronDown, ExternalLink } from 'react-feather';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NetworkSwitchModal } from '../Modal/NetworkSwitchModal';
import { useChainId } from 'wagmi';


interface HeaderProps {
  onNavigate: (path: string) => void;
}

export const Header = ({ onNavigate }: HeaderProps) => {
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const chainId = useChainId();

  const getChainIcon = (id: number): string => {
    if (id === 8217) return '/images/blockchain-icons/kaia-token-icon.png'; // KAIA
    if (id === 42793) return '/images/blockchain-icons/etherlink-icon.png'; // Etherlink
    if (id === 96) return '/images/blockchain-icons/kub-chain-icon.png'; // KUB
    if (id === 42220) return '/images/blockchain-icons/celo-icon.png'; // Celo
    return '';
  };

  const getChainName = (id: number): string => {
    if (id === 8217) return 'KAIA';
    if (id === 42793) return 'Etherlink';
    if (id === 96) return 'KUB';
    if (id === 42220) return 'Celo';
    return '';
  };

  const getChainExplorerUrl = (id: number): string => {
    if (id === 8217) return 'https://kaiascan.io';
    if (id === 42793) return 'https://explorer.etherlink.com';
    if (id === 96) return 'https://kubscan.com';
    if (id === 42220) return 'https://celoscan.io';
    return '';
  };

  const handleViewHistory = (account: string) => {
    const explorerUrl = getChainExplorerUrl(chainId);
    window.open(`${explorerUrl}/address/${account}`, '_blank');
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 h-18">
      {/* Left Section */}
      <div className="hidden md:flex items-center gap-6">
        {/* Brand Logo */}
        <div
          className="hidden md:flex items-center cursor-pointer relative"
          onClick={() => onNavigate('/')}
        >
          <img
            src="/images/kilolend-logo-desktop.png"
            alt="KiloLend"
            className="h-13 w-38"
          />
          {/* v2 Badge */}
          <div className="absolute -top-1 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            v2
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => onNavigate('/markets')}
          >
            Lending
          </div>
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => onNavigate('/agents')}
          >
            Agent Hub
          </div>
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => onNavigate('/launch-token')}
          >
            Launch Agent
          </div>

          {/* More Dropdown */}
          <div className="relative">
            <div
              className={`text-base font-medium cursor-pointer flex items-center gap-1 transition-colors ${showNavDropdown ? 'text-green-500' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => setShowNavDropdown(!showNavDropdown)}
            >
              More
              <ChevronDown
                size={16}
                className={`transition-transform ${showNavDropdown ? 'rotate-180' : ''}`}
              />
            </div>

            {/* Dropdown Menu */}
            {showNavDropdown && (
              <div className="absolute top-full left-0 bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[200px] z-100 mt-2">
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    onNavigate('/leaderboard');
                    setShowNavDropdown(false);
                  }}
                >
                  Leaderboard
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    onNavigate('/portfolio');
                    setShowNavDropdown(false);
                  }}
                >
                  Portfolio
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    window.open('https://docs.kilolend.xyz', '_blank', 'noopener,noreferrer');
                    setShowNavDropdown(false);
                  }}
                >
                  <span>Documentation</span>
                  <ExternalLink size={14} />
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    window.open('https://discord.gg/BDQnjcHbnj', '_blank', 'noopener,noreferrer');
                    setShowNavDropdown(false);
                  }}
                >
                  <span>Discord</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        className="flex gap-1 items-center justify-center min-w-[280px] h-12 text-white bg-green-500 rounded-xl border-none text-lg font-bold cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
                        onClick={openConnectModal}
                        type="button"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        className="flex gap-1 items-center justify-center min-w-[280px] h-12 text-white bg-green-500 rounded-xl border-none text-lg font-bold cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
                        onClick={openChainModal}
                        type="button"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className='flex flex-row'>
                      {/* Network Badge */}
                      <button
                        className="flex my-auto items-center gap-2 px-3 py-2 mx-1 bg-white border border-slate-200 rounded-xl cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
                        onClick={() => setShowNetworkModal(true)}
                        type="button"
                      >
                        <img
                          src={getChainIcon(chain.id)}
                          alt={chain.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm font-medium text-slate-700">{getChainName(chain.id)}</span>
                      </button>

                      {/* History Button */}
                      <button
                        className="flex  my-auto items-center justify-center mx-1 w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-100 hover:text-slate-900 text-slate-500"
                        onClick={() => handleViewHistory(account.address)}
                        type="button"
                      >
                        <Clock size={20} />
                      </button>

                      {/* Wallet Address Button */}
                      <button
                        className="flex  my-auto mx-1 gap-1 items-center justify-center min-w-[280px] h-12 text-green-500 bg-white border border-green-500 rounded-xl text-lg font-bold cursor-pointer transition-all hover:bg-green-50   "
                        onClick={openAccountModal}
                        type="button"
                      >
                        {account.displayName}
                      </button>

                      {/* Network Switch Modal */}
                      <NetworkSwitchModal
                        isOpen={showNetworkModal}
                        onClose={() => setShowNetworkModal(false)}
                      />
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
};
