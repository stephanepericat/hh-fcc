const { ethers, run, network } = require("hardhat")

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log("Deployed at: ", simpleStorage.address)
  // console.log("chain id", network.config.chainId)
  // console.log(
  //   "config",
  //   process.env.GOERLI_CHAIN_ID,
  //   process.env.ETHERSCAN_API_KEY
  // )
  if (
    network.config.chainId === parseInt(process.env.GOERLI_CHAIN_ID) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // wait so etherscan knows about the contract
    await simpleStorage.deployTransaction.wait(6)
    await verify(simpleStorage.address, [])
  }

  const currentFavoriteNumber = await simpleStorage.retrieve()
  console.log("currentFavoriteNumber", currentFavoriteNumber.toString())

  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)

  const updatedFavoriteNumber = await simpleStorage.retrieve()
  console.log("updatedFavoriteNumber", updatedFavoriteNumber.toString())
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.error(e)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
