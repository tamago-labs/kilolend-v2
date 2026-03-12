import { useMemo } from 'react';
import { useMarketsStore } from '../../../store/markets';
import type { MarketDataWithChain } from '../../../store/markets';
import { ArrowRight } from 'react-feather';
import { getTokenIcon } from '../../../utils/tokenIcons';

interface TopMarketsCardProps {
  onNavigate: (path: string) => void;
}

const CHAIN_NAMES: Record<number, string> = {
  96: 'KUB',
  8217: 'KAIA',
  42793: 'Etherlink',
  42220: 'Celo',
};

const TOKEN_NAMES: Record<string, string> = {
  'USDT': 'Tether Official',
  'USDC': 'USD Coin',
  'KAIA': 'KAIA Native',
  'SIX': 'Six Protocol',
  'WBTC': 'Wrapped Bitcoin',
  'WETH': 'Wrapped Ethereum',
  'KDAI': 'KaiDAI',
  'KUSDT': 'KaiUSDT',
  'KUSDC': 'KaiUSDC',
  'MBX': 'MARBLEX',
  'stKAIA': 'Lair Staked KAIA',
  'ETH': 'Ethereum',
  'KUB': 'KUB Coin',
  'CELO': 'Celo',
  'CEUR': 'Celo Euro',
};

export const TopMarketsCard = ({ onNavigate }: TopMarketsCardProps) => {
  const marketsData = useMarketsStore((state) => state.marketsData);

  // Compute all markets with chainId and top 5 markets (memoized)
  const topMarkets = useMemo(() => {
    const allMarkets: MarketDataWithChain[] = [];
    for (const chainId in marketsData) {
      const chainMarkets = Object.values(marketsData[chainId] || {});
      allMarkets.push(
        ...chainMarkets.map(m => ({ ...m, chainId: parseInt(chainId) }))
      );
    }

    const filtered = allMarkets
      .filter((m: MarketDataWithChain) => m.rates.supplyApy > 0);

    const sorted = filtered
      .sort((a: MarketDataWithChain, b: MarketDataWithChain) => b.rates.supplyApy - a.rates.supplyApy)
      .slice(0, 5);

    return sorted;
  }, [marketsData]);

  const handleNavigateToMarkets = () => {
    onNavigate('/markets');
  };

  const isHighAPY = (apy: number) => apy >= 5.0;

  const renderTokenIcon = (market: MarketDataWithChain): React.ReactNode => {
    const iconUrl = getTokenIcon(market.symbol);
    
    return (
      <img 
        src={iconUrl} 
        alt={market.symbol}
        className="w-8 h-8 rounded-full flex-shrink-0"
        onError={(e) => {
          // Fallback to gradient with initials
          e.currentTarget.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0';
          fallback.textContent = market.symbol.slice(0, 2).toUpperCase();
          e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
        }}
      />
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-lg h-full flex flex-col group">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Supply with Best Rates
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Earn Competitive APY on Your Assets
          </p>
        </div>
        <button
          onClick={handleNavigateToMarkets}
          className="bg-green-500 text-white border-none px-5 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all hover:scale-105 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto flex items-center gap-2"
        >
          View Markets
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Markets List */}
      <div className="flex flex-col flex-1">
        {topMarkets.map((market) => {
          const chainName = CHAIN_NAMES[market.chainId] || 'Unknown';
          const isHigh = isHighAPY(market.rates.supplyApy);
          
          return (
            <div
              key={`${market.chainId}-${market.address}`}
              onClick={handleNavigateToMarkets}
              className="flex justify-between items-center py-4 border-b border-slate-200 last:border-0 transition-colors cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg"
            >
              {/* Token Info */}
              <div className="flex items-center gap-3">
                {renderTokenIcon(market)}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-slate-800">
                      {market.symbol}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                      {chainName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {TOKEN_NAMES[market.symbol] || market.name}
                  </span>
                </div>
              </div>

              {/* APY */}
              <div className="flex flex-col items-end">
                <span
                  className={`text-xl font-bold ${
                    isHigh ? 'text-green-600' : 'text-slate-800'
                  }`}
                >
                  {market.rates.supplyApy.toFixed(2)}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Supply APY
                </span>
              </div>
            </div>
          );
        })}

        {topMarkets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <p className="text-sm">Loading market data...</p>
          </div>
        )}
      </div>
    </div>
  );
};