const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  // log("chainId", chainId)

  log("Deploying FundMe contract...")

  let address

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    address = ethUsdAggregator.address
  } else {
    address = networkConfig[chainId].ethUsdPriceFeed
  }

  const args = [address]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }

  log("------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
