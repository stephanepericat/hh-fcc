const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer, mockV3Aggregator
      const sendValue = ethers.utils.parseEther("0.0000000001")
      beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async () => {
        it("should set the aggregator address correctly", async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async () => {
        it("should fail if you don't spend enough eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotEnoughMoney"
          )
        })

        it("should update the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })
      })

      describe("withdraw", function () {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("should withdraw ETH from a single funder", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait()
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Assert
          // Maybe clean up to understand the testing
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("should withdraw cheaper ETH from a single funder", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait()
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Assert
          // Maybe clean up to understand the testing
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        // this test is overloaded. Ideally we'd split it into multiple tests
        // but for simplicity we left it as one
        it("should allow us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners()
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transactionResponse = await fundMe.withdraw()
          // Let's comapre gas costs :)
          // const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait()
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
          // console.log(`GasCost: ${withdrawGasCost}`)
          // console.log(`GasUsed: ${gasUsed}`)
          // console.log(`GasPrice: ${effectiveGasPrice}`)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Assert
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
          )
          // Make a getter for storage variables
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("should only allow the owner to withdraw", async function () {
          const accounts = await ethers.getSigners()
          const fundMeConnectedContract = await fundMe.connect(accounts[1])
          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })
    })
