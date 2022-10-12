const Ethers = require("ethers")
const fs = require("fs-extra")

require("dotenv").config()

async function main() {
  const provider = new Ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_RPC
  )
  const encryptedJson = fs.readFileSync("./.encryptedKey.json")
  // const wallet = new Ethers.Wallet(process.env.PRIVATE_KEY, provider);
  let wallet = new Ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
  )
  wallet = await wallet.connect(provider)
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  )

  try {
    console.log("Deploying, please wait...")
    const contractFactory = new Ethers.ContractFactory(abi, binary, wallet)
    const contract = await contractFactory.deploy()
    const deploymentReceipt = await contract.deployTransaction.wait(1)
    console.log(`Contract deployed to ${contract.address}`)
    // console.log("deploymentReceipt", deploymentReceipt);
    // console.log("let's deploy with transaction data");
    // const nonce = await wallet.getTransactionCount();
    // console.log("nonce", nonce);
    // const tx = {
    //   nonce,
    //   gasPrice: 20000000000,
    //   gasLimit: 1000000,
    //   to: null,
    //   value: 0,
    //   data: `0x${binary}`,
    //   chainId: parseInt(process.env.CHAIN_ID),
    // };

    // const sendTxResponse = await wallet.sendTransaction(tx);
    // await sendTxResponse.wait(1);
    // console.log("sendTxResponse", sendTxResponse);

    const currentFavoriteNumber = await contract.retrieve()
    console.log("currentFavoriteNumber", currentFavoriteNumber.toString())
    const txResponse = await contract.store("7")
    const txReceipt = await txResponse.wait(1)
    const updatedFavoriteNumber = await contract.retrieve()
    console.log("updatedFavoriteNumber", updatedFavoriteNumber.toString())
  } catch (e) {
    console.log("error", e)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
