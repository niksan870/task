// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Product', () => {
  let productContract, ownerConn, owner, client, events;

  before(async () => {
    productContract = await ethers.getContractFactory('Product');
    ownerConn = await productContract.deploy();
    [owner,, client, ] = await ethers.getSigners();
    const EventContract = await ethers.getContractFactory("Events");
    events = await EventContract.deploy();
  })

  describe('addProduct', async () => {
    it('Should create products only by owner', async () => {
      const clientInstance = ownerConn.connect(client);

      await expect(clientInstance.addProduct('apple', 100, 3))
      .to.be.revertedWithCustomError(clientInstance, "NotOwner");
    });

    it('Should revert when 0 has been passed as a quantity', async () => {
      await expect(ownerConn.addProduct('pear', 0, 2))
      .to.be.revertedWithCustomError(ownerConn, "NegativeQuantity");
    });

    it('Should revert if name was empty', async () => {
      await expect(ownerConn.addProduct('', 10, 1))
      .to.be.revertedWithCustomError(ownerConn, "EmptyName");
    });

    it('Should revert different price was given', async () => {
      await ownerConn.addProduct('letuce', 10, 1);

      await expect(ownerConn.addProduct('letuce', 10, 3))
      .to.be.revertedWithCustomError(ownerConn, "NewPriceIntroduced");
    });

    it('Should create apple', async () => {
      await expect(ownerConn.addProduct('apple', 100, 3))
      .to.emit(events.attach(ownerConn.address), 'CreateProduct').withArgs(owner.address, 'apple', 100, 3)
    });

    it('Should increase quantity if the same product has been added twice', async () => {
      await ownerConn.addProduct('banana', 1, 4);

      await expect(ownerConn.addProduct('banana', 1, 4))
      .to.emit(events.attach(ownerConn.address), 'IncreaseProductQuantity').withArgs(owner.address, 'banana', 2);
    });
  });

  describe('getAvailableProducts', async () => {
    it('Should get available product', async () => {
      expect(await ownerConn.getAvailableProducts())
      .to.deep.equal(['letuce', 'apple', 'banana']);
    });
  });
});
