import { useMarkets, useMarketData, useMarketBasicInfo, useTokenInfo, usePrice, type MarketData } from '../../hooks';
import { NATIVE_TOKENS } from '../../contracts/config';
import { useChainId } from 'wagmi';
import { formatUnits } from 'viem'; 

/**
 * Single Market Row Component
 * This is a separate component so we can use hooks for each market
 */
function MarketRow({ market }: { market: MarketData }) {
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
 * Example component showing how to display markets
 * For a production app with many markets, consider:
 * 1. Using useReadContracts from wagmi for batch fetching
 * 2. Implementing pagination
 * 3. Using a dedicated data fetching solution
 */
export function MarketsTable() {
  const chainId = useChainId();
  const { markets, isLoading: marketsLoading } = useMarkets(chainId);

  if (marketsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">Loading markets...</div>
      </div>
    );
  }

  if (!markets || markets.length === 0) {
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
          {markets.slice(0, 10).map((marketAddress) => (
            <MarketsTableRow key={marketAddress} marketAddress={marketAddress} chainId={chainId} />
          ))}
        </tbody>
      </table> 
    </div>
  );
}

/**
 * Individual row component that fetches its own data
 * Each market row fetches its own data independently
 */
function MarketsTableRow({ marketAddress, chainId }: { marketAddress: `0x${string}`; chainId?: number }) {
  // Step 1: Get cToken basic info (includes isNative flag)
  const { data: cTokenInfo, isLoading: cTokenLoading } = useMarketBasicInfo(marketAddress);

  // Step 2: Check if it's a native token market
  const isNative = cTokenInfo?.isNative;

  // Step 3: Get underlying token info (only for non-native tokens)
  const { token: underlyingToken, isLoading: tokenLoading } = useTokenInfo(
    isNative ? undefined : cTokenInfo?.underlying
  );
   
  // Step 4: Build market object with correct token info
  const marketObj = cTokenInfo && (isNative || underlyingToken)
    ? {
        address: marketAddress,
        underlying: cTokenInfo.underlying,
        // For native tokens, use the cToken info (which is already the native token)
        // For ERC-20 tokens, use the underlying token info
        symbol: isNative 
          ? cTokenInfo.symbol.replace('c', '') // Remove 'c' prefix (e.g., "cKUB" -> "KUB")
          : underlyingToken!.symbol,
        name: isNative
          ? NATIVE_TOKENS[chainId || 96]?.name || cTokenInfo.name.replace('Compound ', '') // Use native token name
          : underlyingToken!.name,
        decimals: isNative
          ? NATIVE_TOKENS[chainId || 96]?.decimals || 18 // Use native token decimals
          : underlyingToken!.decimals,
      }
    : undefined;
 
  // Step 5: Get market data (rates, stats)
  const { data: marketData, isLoading: marketDataLoading } = useMarketData(marketObj, chainId);
 
  const isLoading = cTokenLoading || (!isNative && tokenLoading) || marketDataLoading;

  if (isLoading) {
    return (
      <tr>
        <td colSpan={7} className="py-3 px-4 text-center text-slate-600">
          Loading market data...
        </td>
      </tr>
    );
  }

  if (!marketData) {
    return (
      <tr>
        <td colSpan={7} className="py-3 px-4 text-center text-slate-600">
          No data available
        </td>
      </tr>
    );
  }

  return <MarketRow market={marketData} />;
}
