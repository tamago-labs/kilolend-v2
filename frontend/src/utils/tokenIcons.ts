/**
 * Get token icon URL by symbol
 */
export const getTokenIcon = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  
  // KAIA tokens
  if (upperSymbol === 'KAIA') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png';
  }
  if (upperSymbol === 'STKAIA') {
    return 'https://assets.coingecko.com/coins/images/40001/standard/token_stkaia.png';
  }
  if (upperSymbol === 'KLAW') {
    return '/images/token-icons/klaw-icon.png';
  }
  if (upperSymbol === 'SIX') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png';
  }
  if (upperSymbol === 'BORA') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png';
  }
  if (upperSymbol === 'MBX') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png';
  }
  if (upperSymbol === 'KUSDT') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';
  }
  if (upperSymbol === 'KUSDC') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png';
  }
  
  // KUB tokens
  if (upperSymbol === 'KUB' || upperSymbol === 'KKUB') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/16093.png';
  }
  
  // Etherlink tokens
  if (upperSymbol === 'XTZ') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png';
  }
  if (upperSymbol === 'WXTZ') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/35930.png';
  }
  
  // Common stablecoins
  if (upperSymbol === 'USDT' || upperSymbol === 'USDT.e' || upperSymbol === 'USDT_KUB' || upperSymbol === "USD₮") {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';
  }
  if (upperSymbol === 'USDC' || upperSymbol === 'USDC.e' || upperSymbol === 'USDC_KUB') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png';
  }
  
  // Common tokens
  if (upperSymbol === 'WBTC') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png';
  }
  if (upperSymbol === 'WETH' || upperSymbol === 'ETH') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png';
  }
  if (upperSymbol === 'CELO') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png';
  }
  if (upperSymbol === 'CEUR') {
    return 'https://s2.coinmarketcap.com/static/img/coins/64x64/19535.png';
  }
  
  // Fallback: try local image
  const localIcon = `/images/token-icons/${upperSymbol.toLowerCase()}-icon.png`;
  return localIcon;
};