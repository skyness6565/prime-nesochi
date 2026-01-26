// Generate realistic-looking cryptocurrency wallet addresses

const generateRandomHex = (length: number): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateRandomBase58 = (length: number): string => {
  // Base58 alphabet (no 0, O, I, l)
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateRandomAlphanumeric = (length: number): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export interface CryptoAddressConfig {
  coinId: string;
  symbol: string;
  network: string;
  generateAddress: () => string;
}

// All supported cryptocurrencies with realistic address formats
export const CRYPTO_ADDRESS_CONFIGS: CryptoAddressConfig[] = [
  // Bitcoin
  {
    coinId: "bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
    generateAddress: () => `1${generateRandomBase58(33)}`,
  },
  {
    coinId: "bitcoin",
    symbol: "BTC",
    network: "Bitcoin (SegWit)",
    generateAddress: () => `bc1q${generateRandomAlphanumeric(38)}`.toLowerCase(),
  },
  // Ethereum
  {
    coinId: "ethereum",
    symbol: "ETH",
    network: "Ethereum",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  // Tether
  {
    coinId: "tether",
    symbol: "USDT",
    network: "Ethereum (ERC-20)",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  {
    coinId: "tether",
    symbol: "USDT",
    network: "Tron (TRC-20)",
    generateAddress: () => `T${generateRandomBase58(33)}`,
  },
  // Solana
  {
    coinId: "solana",
    symbol: "SOL",
    network: "Solana",
    generateAddress: () => generateRandomBase58(44),
  },
  // BNB
  {
    coinId: "binancecoin",
    symbol: "BNB",
    network: "BNB Smart Chain",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  {
    coinId: "binancecoin",
    symbol: "BNB",
    network: "BNB Beacon Chain",
    generateAddress: () => `bnb1${generateRandomAlphanumeric(38)}`.toLowerCase(),
  },
  // XRP
  {
    coinId: "ripple",
    symbol: "XRP",
    network: "XRP Ledger",
    generateAddress: () => `r${generateRandomBase58(33)}`,
  },
  // Cardano
  {
    coinId: "cardano",
    symbol: "ADA",
    network: "Cardano",
    generateAddress: () => `addr1${generateRandomBase58(98)}`.toLowerCase(),
  },
  // Dogecoin
  {
    coinId: "dogecoin",
    symbol: "DOGE",
    network: "Dogecoin",
    generateAddress: () => `D${generateRandomBase58(33)}`,
  },
  // Polkadot
  {
    coinId: "polkadot",
    symbol: "DOT",
    network: "Polkadot",
    generateAddress: () => `1${generateRandomBase58(47)}`,
  },
  // Avalanche
  {
    coinId: "avalanche-2",
    symbol: "AVAX",
    network: "Avalanche C-Chain",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  // Chainlink
  {
    coinId: "chainlink",
    symbol: "LINK",
    network: "Ethereum",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  // Polygon
  {
    coinId: "polygon",
    symbol: "MATIC",
    network: "Polygon",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  // Uniswap
  {
    coinId: "uniswap",
    symbol: "UNI",
    network: "Ethereum",
    generateAddress: () => `0x${generateRandomHex(40)}`,
  },
  // Litecoin
  {
    coinId: "litecoin",
    symbol: "LTC",
    network: "Litecoin",
    generateAddress: () => `L${generateRandomBase58(33)}`,
  },
  // Cosmos
  {
    coinId: "cosmos",
    symbol: "ATOM",
    network: "Cosmos",
    generateAddress: () => `cosmos1${generateRandomAlphanumeric(38)}`.toLowerCase(),
  },
  // Tron
  {
    coinId: "tron",
    symbol: "TRX",
    network: "Tron",
    generateAddress: () => `T${generateRandomBase58(33)}`,
  },
  // Stellar
  {
    coinId: "stellar",
    symbol: "XLM",
    network: "Stellar",
    generateAddress: () => `G${generateRandomBase58(55)}`.toUpperCase(),
  },
  // Monero
  {
    coinId: "monero",
    symbol: "XMR",
    network: "Monero",
    generateAddress: () => `4${generateRandomBase58(94)}`,
  },
];

// Generate all default wallet addresses for a user
export const generateDefaultWalletAddresses = (): Omit<CryptoAddressConfig, 'generateAddress'>[] => {
  // Generate unique addresses for primary network of each coin
  const primaryCoins = [
    "bitcoin",
    "ethereum", 
    "tether",
    "solana",
    "binancecoin",
    "ripple",
    "cardano",
    "dogecoin",
    "polkadot",
    "avalanche-2",
    "chainlink",
    "polygon",
    "uniswap",
    "litecoin",
    "cosmos",
  ];

  const result: { coinId: string; symbol: string; network: string; wallet_address: string }[] = [];

  for (const coinId of primaryCoins) {
    const config = CRYPTO_ADDRESS_CONFIGS.find(c => c.coinId === coinId);
    if (config) {
      result.push({
        coinId: config.coinId,
        symbol: config.symbol,
        network: config.network,
        wallet_address: config.generateAddress(),
      });
    }
  }

  return result;
};

// Generate address for a specific coin and network
export const generateWalletAddress = (coinId: string, network?: string): string => {
  const config = CRYPTO_ADDRESS_CONFIGS.find(
    c => c.coinId === coinId && (network ? c.network === network : true)
  );
  
  if (!config) {
    // Default to Ethereum-style address
    return `0x${generateRandomHex(40)}`;
  }
  
  return config.generateAddress();
};
