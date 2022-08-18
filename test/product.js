// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Product', () => {
  let productContract, ownerConn, client;

  before(async () => {
    productContract = await ethers.getContractFactory('Product');
    ownerConn = await productContract.deploy();
    [,, client, ] = await ethers.getSigners();
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
      .to.emit(ownerConn, 'ProductEvent').withArgs('CREATE');
    });

    it('Should increase quantity if the same product has been added twice', async () => {
      await ownerConn.addProduct('banana', 1, 4);

      await expect(ownerConn.addProduct('banana', 1, 4))
      .to.emit(ownerConn, 'ProductEvent').withArgs('UPDATE');
    });
  });

  describe('getAvailableProducts', async () => {
    it('Should get available product', async () => {
      expect(await ownerConn.getAvailableProducts())
      .to.deep.equal(['letuce', 'apple', 'banana']);
    });
  });
});
