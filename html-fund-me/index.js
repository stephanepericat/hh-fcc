import { ethers } from "./ethers-5.4.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundBtn")

// console.log(contractAddress)

connectButton.onclick = connect
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
fundButton.onclick = fund

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      })
    } catch (e) {
      console.log("unable to connect", e)
    }
    console.log("connected!")
    connectButton.innerHTML = "Connected"
  } else {
    connectButton.innerHTML = "Please Install Metamask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  } else {
    balanceButton.innerHTML = "Please Install Metamask"
  }
}

async function fund() {
  if (typeof window.ethereum !== "undefined") {
    // console.log(`Funding with: ${ethAmount}...`, ethers)
    const ethAmount = document.getElementById("ethAmount").value
    const amount = ethers.utils.parseEther(ethAmount)
    console.log(`Funding with ${amount}`)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log("contract", contract)
    // console.log("amount", ethers.utils.parseEther(ethAmount))
    try {
      const transactionResponse = await contract.fund({
        value: amount,
      })
      await listenForTransationMined(transactionResponse, provider)
      console.log("Done!")
    } catch (e) {
      console.log("error", e)
    }
  }
}

function listenForTransationMined(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  // return new Promise()
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with: ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      console.log("Withdrawing funds...")
      const transactionResponse = await contract.withdraw()
      await listenForTransationMined(transactionResponse, provider)
    } catch (e) {
      console.log(e)
    }
  } else {
    withdrawButton.innerHTML = "Please Install Metamask"
  }
}
