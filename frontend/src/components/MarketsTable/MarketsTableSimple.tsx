/**
 * Simplified MarketsTable using the Markets Store
 * This demonstrates how to use the store after it handles complete fetching
 */

import { useMarketsStore, selectMarketsArray } from '../../store/markets';
import { usePrice } from '../../hooks';
import { formatUnits } from 'viem';

/**
 * Single Market Row Component
 * Now reads all data from the store - no individual fetching needed
 */
function MarketRow({ market }: { market: any }) {
  const price = usePrice(market.symbol);
  
  // Calculate USD values
  const totalSupplyToken = parseFloat(formatUnits(market.stats.totalSupply, market.decimals));
  const totalBorrowsToken = parseFloat(formatUnits(market.stats.totalBorrows, market.decimals));
  const availableLiquidityToken = parseFloat(formatUnits(market.stats.availableLiquidity, market.decimals));
  
  const totalSupplyUSD = price ? totalSupplyToken * price : 0;
  const totalBorrowsUSD = price ? totalBorrowsToken * price : 0;
  const availableLiquidityUSD = price ? availableLiquidityToken * price : 0;
  
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };
  
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">
        <div>
          <div className="font-medium text-slate-900">{market.symbol}</div>
          <div className="text-sm text-slate-600">{market.name}</div>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-green-600 font-medium">
          {(market.rates.supplyApy).toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-blue-600 font-medium">
          {(market.rates.borrowApy).toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-4 text-right text-slate-900">
        <div className="text-sm text-slate-500">{formatUnits(market.stats.totalSupply, market.decimals).slice(0, 10)}</div>
        <div className="font-medium text-slate-900">{formatLargeNumber(totalSupplyUSD)}</div>
      </td>
      <td className="py-3 px-4 text-right text-slate-900">
        <div className="text-sm text-slate-500">{formatUnits(market.stats.totalBorrows, market.decimals).slice(0, 10)}</div>
        <div className="font-medium text-slate-900">{formatLargeNumber(totalBorrowsUSD)}</div>
      </td>
      <td className="py-3 px-4 text-right text-slate-900">
        <div className="text-sm text-slate-500">{formatUnits(market.stats.availableLiquidity, market.decimals).slice(0, 10)}</div>
        <div className="font-medium text-slate-900">{formatLargeNumber(availableLiquidityUSD)}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${market.stats.utilizationRate > 0.8
          ? 'bg-red-100 text-red-700'
          : market.stats.utilizationRate > 0.5
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
          }`}>
          {(market.stats.utilizationRate * 100).toFixed(2)}%
        </span>
      </td>
    </tr>
  );
}

/**
 * Simplified MarketsTable using the Markets Store
 * No need for individual market fetching - all data comes from the store
 */
export function MarketsTableSimple({ chainId }: { chainId: number }) {
  const marketsData = useMarketsStore((state) => selectMarketsArray(state, chainId));
  const isLoading = useMarketsStore((state) => state.isLoading[chainId] || false);
  const error = useMarketsStore((state) => state.errors[chainId] || null);
  const hasFetched = useMarketsStore((state) => state.hasFetched[chainId] || false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">Loading markets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!hasFetched || marketsData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">No markets available</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Asset</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Supply APY</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Borrow APY</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Total Supply</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Total Borrows</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Liquidity</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Utilization</th>
          </tr>
        </thead>
        <tbody>
          {marketsData.map((market) => (
            <MarketRow key={market.address} market={market} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Example usage in your app:
 * 
 * ```tsx
 * import { useInitializeMarkets } from '@/hooks';
 * import { MarketsTableSimple } from '@/components/MarketsTable/MarketsTableSimple';
 * 
 * function App() {
 *   const chainId = 8217; // Kaia
 *   
 *   // Initialize markets (this will fetch all data and start auto-refresh)
 *   useInitializeMarkets(chainId);
 *   
 *   return (
 *     <div>
 *       <MarketsTableSimple chainId={chainId} />
 *     </div>
 *   );
 * }
 * ```
 */