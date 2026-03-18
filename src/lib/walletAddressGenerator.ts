// Fixed wallet addresses for all cryptocurrencies
// These addresses are the same for every user and cannot be changed

export interface CryptoAddressConfig {
  coinId: string;
  symbol: string;
  network: string;
  wallet_address: string;
}

// Fixed addresses mapped by coin ID
const FIXED_ADDRESSES: Record<string, string> = {
  bitcoin: "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  ethereum: "0xcf784634f7077c773b8513865aa15fb04424482e",
  tether: "0xcf784634f7077c773b8513865aa15fb04424482e",
  solana: "FyGT7cJ43yioKWDYhiPpGBMGsSLLHcJKp9dzvQiT3XRj",
  binancecoin: "0xcf784634f7077c773b8513865aa15fb04424482e",
  ripple: "r9uSLcuUwfNFyRuQQz9GJoVWEfYpG86DGT",
  cardano: "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  dogecoin: "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  polkadot: "0xcf784634f7077c773b8513865aa15fb04424482e",
  "avalanche-2": "0xcf784634f7077c773b8513865aa15fb04424482e",
  chainlink: "0xcf784634f7077c773b8513865aa15fb04424482e",
  "polygon-ecosystem-token": "0xcf784634f7077c773b8513865aa15fb04424482e",
  uniswap: "0xcf784634f7077c773b8513865aa15fb04424482e",
  litecoin: "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  cosmos: "0xcf784634f7077c773b8513865aa15fb04424482e",
  tron: "TLd3N14ik2pQBRh7mazW7UTnz595K9EBnW",
  stellar: "0xcf784634f7077c773b8513865aa15fb04424482e",
  monero: "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  "usd-coin": "0xcf784634f7077c773b8513865aa15fb04424482e",
  "bitcoin-cash": "bc1q37hx2mkluukeymn6s8a2d9kvjhdqvshdll9zf6",
  "shiba-inu": "0xcf784634f7077c773b8513865aa15fb04424482e",
  "wrapped-bitcoin": "0xcf784634f7077c773b8513865aa15fb04424482e",
  dai: "0xcf784634f7077c773b8513865aa15fb04424482e",
};

// All supported cryptocurrencies with their fixed addresses
export const CRYPTO_ADDRESS_CONFIGS: CryptoAddressConfig[] = [
  { coinId: "bitcoin", symbol: "BTC", network: "Bitcoin (SegWit)", wallet_address: FIXED_ADDRESSES.bitcoin },
  { coinId: "ethereum", symbol: "ETH", network: "Ethereum", wallet_address: FIXED_ADDRESSES.ethereum },
  { coinId: "tether", symbol: "USDT", network: "Ethereum (ERC-20)", wallet_address: FIXED_ADDRESSES.tether },
  { coinId: "solana", symbol: "SOL", network: "Solana", wallet_address: FIXED_ADDRESSES.solana },
  { coinId: "binancecoin", symbol: "BNB", network: "BNB Smart Chain", wallet_address: FIXED_ADDRESSES.binancecoin },
  { coinId: "ripple", symbol: "XRP", network: "XRP Ledger", wallet_address: FIXED_ADDRESSES.ripple },
  { coinId: "cardano", symbol: "ADA", network: "Cardano", wallet_address: FIXED_ADDRESSES.cardano },
  { coinId: "dogecoin", symbol: "DOGE", network: "Dogecoin", wallet_address: FIXED_ADDRESSES.dogecoin },
  { coinId: "polkadot", symbol: "DOT", network: "Polkadot", wallet_address: FIXED_ADDRESSES.polkadot },
  { coinId: "avalanche-2", symbol: "AVAX", network: "Avalanche C-Chain", wallet_address: FIXED_ADDRESSES["avalanche-2"] },
  { coinId: "chainlink", symbol: "LINK", network: "Ethereum", wallet_address: FIXED_ADDRESSES.chainlink },
  { coinId: "polygon-ecosystem-token", symbol: "POL", network: "Polygon", wallet_address: FIXED_ADDRESSES["polygon-ecosystem-token"] },
  { coinId: "uniswap", symbol: "UNI", network: "Ethereum", wallet_address: FIXED_ADDRESSES.uniswap },
  { coinId: "litecoin", symbol: "LTC", network: "Litecoin", wallet_address: FIXED_ADDRESSES.litecoin },
  { coinId: "cosmos", symbol: "ATOM", network: "Cosmos", wallet_address: FIXED_ADDRESSES.cosmos },
  { coinId: "tron", symbol: "TRX", network: "Tron", wallet_address: FIXED_ADDRESSES.tron },
  { coinId: "stellar", symbol: "XLM", network: "Stellar", wallet_address: FIXED_ADDRESSES.stellar },
  { coinId: "monero", symbol: "XMR", network: "Monero", wallet_address: FIXED_ADDRESSES.monero },
];

// All supported coin IDs - matches CoinGecko API
export const ALL_SUPPORTED_COINS = [
  "bitcoin", "ethereum", "tether", "binancecoin", "solana", "ripple",
  "usd-coin", "cardano", "dogecoin", "polkadot", "avalanche-2", "chainlink",
  "polygon-ecosystem-token", "tron", "uniswap", "litecoin", "cosmos",
  "stellar", "monero", "bitcoin-cash", "shiba-inu", "wrapped-bitcoin", "dai",
];

// Generate all default wallet addresses for a user - all use fixed addresses
export const generateDefaultWalletAddresses = (): { coinId: string; symbol: string; network: string; wallet_address: string }[] => {
  const result: { coinId: string; symbol: string; network: string; wallet_address: string }[] = [];
  const processedCoins = new Set<string>();

  for (const config of CRYPTO_ADDRESS_CONFIGS) {
    if (!processedCoins.has(config.coinId)) {
      result.push({
        coinId: config.coinId,
        symbol: config.symbol,
        network: config.network,
        wallet_address: config.wallet_address,
      });
      processedCoins.add(config.coinId);
    }
  }

  const additionalCoins: Record<string, { symbol: string; network: string }> = {
    "usd-coin": { symbol: "USDC", network: "Ethereum (ERC-20)" },
    "bitcoin-cash": { symbol: "BCH", network: "Bitcoin Cash" },
    "shiba-inu": { symbol: "SHIB", network: "Ethereum (ERC-20)" },
    "wrapped-bitcoin": { symbol: "WBTC", network: "Ethereum (ERC-20)" },
    "dai": { symbol: "DAI", network: "Ethereum (ERC-20)" },
  };

  for (const coinId of ALL_SUPPORTED_COINS) {
    if (!processedCoins.has(coinId) && additionalCoins[coinId]) {
      const info = additionalCoins[coinId];
      result.push({
        coinId,
        symbol: info.symbol,
        network: info.network,
        wallet_address: generateWalletAddress(coinId),
      });
      processedCoins.add(coinId);
    }
  }

  return result;
};

// Get the fixed address for a specific coin
export const generateWalletAddress = (coinId: string, _network?: string): string => {
  return FIXED_ADDRESSES[coinId] || FIXED_ADDRESSES.ethereum;
};
