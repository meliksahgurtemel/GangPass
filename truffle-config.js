const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const infuraURL = "https://rinkeby.infura.io/v3/{INFURA_KEY}";
const infuraMainnet = "https://mainnet.infura.io/v3/{INFURA_KEY}";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    bsctest: {
      provider: () => new HDWalletProvider(process.env.mnemonic,"https://data-seed-prebsc-1-s1.binance.org:8545/"),
      network_id: '97',
    },
    bscmain: {
      provider: () => new HDWalletProvider(process.env.privateKey,"https://bsc-dataseed1.defibit.io"),
      network_id: '56',
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.mnemonic, infuraURL),
      network_id: '4',
      gas: 5500000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.mnemonic, infuraMainnet),
      network_id: '1',
    },
  },
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      version:"0.8.11"
    }
  },
  plugins: [
    'truffle-contract-size'
  ]
}
