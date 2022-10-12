const Ethers = require("ethers")
const fs = require("fs-extra")

require("dotenv").config()

async function main() {
  const wallet = new Ethers.Wallet(process.env.PRIVATE_KEY)
  const encryptedPrivateKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
    process.env.PRIVATE_KEY
  )

  console.log(encryptedPrivateKey)

  fs.writeFileSync("./.encryptedKey.json", encryptedPrivateKey)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
