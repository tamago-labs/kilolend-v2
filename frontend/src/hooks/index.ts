/**
 * KiloLend v2 Hooks Index
 * Exports all contract interaction hooks
 */

// Comptroller Contract Hooks
export { useComptrollerContract, useUserMarkets } from './useComptrollerContract';

// Market Contract Hooks
export {
  useMarketBasicInfo,
  useMarketRates,
  useMarketStats,
  useUserMarketData,
  type MarketBasicInfo,
  type MarketRates,
  type MarketStats,
  type UserMarketData,
} from './useMarketContract';

// Token Hooks
export {
  useTokenInfo,
  type TokenInfo,
} from './useTokenInfo';

// Market Hooks
export { useMarkets, type Market } from './useMarkets';

// Market Data Hooks
export {
  useMarketData,
  type MarketData,
} from './useMarketsData';

// Price Hooks
export {
  usePrices,
  usePrice,
  usePriceData,
  usePricesLoading,
  usePricesError,
  useRefreshPrices,
} from './usePrices';
