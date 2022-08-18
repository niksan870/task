require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  gasReporter: {
    currency: 'USD',
    enabled: (process.env.GAS_REPORT) ? true : false,
    coinmarketcap: process.env.coinMarketCap_API,
  }
};
