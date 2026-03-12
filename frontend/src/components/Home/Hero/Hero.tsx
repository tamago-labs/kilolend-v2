import { useState } from 'react';
import { Plus } from 'react-feather';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdSdDIX5OCCHnc2LbKF4j7rfzQEJmsIEhusTK5r6P_XCgYRLw/viewform?usp=dialog';

interface HeroSectionProps {
  onNavigate: (path: string) => void;
}

export const Hero = ({ onNavigate }: HeroSectionProps) => {
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const openGoogleForm = () => {
    window.open(GOOGLE_FORM_URL, '_blank');
  };

  const networks = [
    { id: 'kaia', name: 'KAIA', icon: '/images/blockchain-icons/kaia-token-icon.png' },
    { id: 'kub', name: 'KUB Chain', icon: '/images/blockchain-icons/kub-chain-icon.png' },
    { id: 'etherlink', name: 'Etherlink', icon: '/images/blockchain-icons/etherlink-icon.png' },
    { id: 'celo', name: 'Celo', icon: '/images/blockchain-icons/celo-icon.png' }
  ];

  return (
    <section className="py-20 px-8 mb-12 rounded-3xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content */}
        <div className="z-10">
          <h1 className="text-4xl md:text-[48px] font-extrabold text-slate-800 mb-6 leading-tight">
            On-chain Bank for OpenClaw Agents
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
            Launch OpenClaw agents with wallets and token economies.
            Let agents manage capital, execute tasks, and interact with on-chain protocols autonomously.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => onNavigate('/markets')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none px-8 py-4 text-base font-semibold rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 min-w-[160px] w-[200px]"
            >
              Lend to Agents
            </button>
            <button
              onClick={() => window.open('https://discord.gg/BDQnjcHbnj', '_blank', 'noopener,noreferrer')}
              className="bg-white text-green-500 border-2 border-green-500 px-[30px] py-[14px] text-base font-semibold rounded-xl cursor-pointer transition-all hover:bg-green-500 hover:text-white hover:-translate-y-0.5 min-w-[160px] w-[200px]"
            >
              Meet the Agents
            </button>
          </div>

          {/* Supported Networks */}
          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">
                Supported Networks:
              </span>
              {networks.map((network) => (
                <div
                  key={network.id}
                  className="relative inline-block cursor-pointer mt-1"
                  onMouseEnter={() => setTooltipVisible(network.id)}
                  onMouseLeave={() => setTooltipVisible(null)}
                >
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  />
                  {tooltipVisible === network.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap mb-2 z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                      {network.name}
                    </div>
                  )}
                </div>
              ))}
              {/* Request Network Button */}
              <div
                onClick={openGoogleForm}
                onMouseEnter={() => setTooltipVisible('request-network')}
                onMouseLeave={() => setTooltipVisible(null)}
                className="relative inline-flex items-center justify-center cursor-pointer w-6 h-6 rounded-full bg-slate-100 transition-all hover:bg-slate-200 hover:scale-110 mt-1"
              >
                <Plus size={14} className="text-slate-500" />
                {tooltipVisible === 'request-network' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap mb-2 z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                    Request new network
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Mobile Mockup */}
        <div className="relative flex justify-center items-center transition-all hover:-translate-y-2">
          <div className="w-[320px] h-[640px] bg-slate-800 rounded-[40px] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative transition-shadow hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full bg-white rounded-[28px] overflow-hidden relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-4 text-center font-semibold text-sm flex items-center justify-center gap-2">
                <img
                  src="/images/token-icons/klaw-icon.png"
                  alt="Klawster"
                  className="w-5 h-5 rounded-full"
                />
                $KLAW Discord Channel
              </div>

              {/* Chat Interface */}
              <div className="p-4 h-[calc(100%-48px)] bg-gray-50 flex flex-col gap-3">
                {/* Chat messages with animations */}
                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up">
                    $KLAW Price: $0.006530
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-1s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-1s">
                    🔍 Scanning DeFi protocols for optimal yield...
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-3s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-3s">
                    💰 Auto-supplying to KiloLend protocol - 8.5% APY
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-5s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-5s">
                    📈 Executed profitable trade: +2.3% ETH position
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-7s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-7s">
                    🔥 Auto buyback & burn: 2,500 $KLAW removed
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-9s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-9s">
                    📊 Supply reduced → Price increasing to $0.006620
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <img
                    src="/images/token-icons/klaw-icon.png"
                    alt="Klawster"
                    className="w-6 h-6 rounded-full opacity-0 animate-fade-in-up animation-delay-11s"
                  />
                  <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm opacity-0 animate-fade-in-up animation-delay-11s">
                    ✨ Total token value increased by 1.4%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
