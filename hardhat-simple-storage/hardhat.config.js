require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("./tasks/block-number")

require("dotenv").config()

const {
  COIN_MARKET_CAP_KEY,
  ETHERSCAN_API_KEY,
  GOERLI_CHAIN_ID,
  GOERLI_PRIVATE_KEY,
  GOERLI_RPC_URL,
} = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: parseInt(GOERLI_CHAIN_ID),
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_MARKET_CAP_KEY,
  },
  solidity: "0.8.8",
}
