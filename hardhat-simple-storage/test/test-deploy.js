const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("simpleStorage", function () {
  let SimpleStorageFactory = null
  let simpleStorage

  beforeEach(async function () {
    SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await SimpleStorageFactory.deploy()
  })

  it("should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"
    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue.toString()).to.equal(expectedValue)
  })

  it("should update when we call 'store'", async function () {
    const expectedValue = "7"
    const transactionResponse = await simpleStorage.store(expectedValue)
    await transactionResponse.wait(1)

    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue.toString()).to.equal(expectedValue)
  })
})
