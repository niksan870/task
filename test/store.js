// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { transaction, mineNBlocks } = require('./utils');


describe('Store', () => {
  let storeContract, ownerConn, owner, client, clientConn, secondClient, secondClientConn;

  before(async () => {
    storeContract = await ethers.getContractFactory('Store');
    ownerConn = await storeContract.deploy();
    [owner,, client, secondClient] = await ethers.getSigners();
    clientConn = ownerConn.connect(client);
    secondClientConn = ownerConn.connect(secondClient);
  })

  describe('buyProduct', async () => {
    it('Should revert if higher quantity was requested', async () => {
      await expect(clientConn.buyProduct('apple', 1, transaction('0.00000000000000001')))
      .to.be.revertedWithCustomError(clientConn, "NegativeQuantity");
    });

    it('Should revert if buyer tries to buy the same product twice', async () => {
      await ownerConn.addProduct('banana', 1000, 3);
      const trasactAmount = transaction('0.00000000000000003');

      await clientConn.buyProduct('banana', 10, trasactAmount);
      await expect(clientConn.buyProduct('banana', 10, trasactAmount))
      .to.be.revertedWithCustomError(clientConn, "DubplicateProduct");
    });

    it('Should buy product', async () => {
      let clientsBeforeFirstPurchase = await ownerConn.clientsHaveBoughtProducts();
      await ownerConn.addProduct('melon', 1000, 1);

      await expect(ownerConn.buyProduct('melon', 1, transaction('0.000000000000000001')))
      .to.emit(ownerConn, 'ProductEvent').withArgs('UPDATE')
      .to.emit(ownerConn, 'PurchaseEvent').withArgs('CREATE');

      let clientsAfterFirstPurchase = await ownerConn.clientsHaveBoughtProducts();
      expect(clientsBeforeFirstPurchase.length).to.be.below(clientsAfterFirstPurchase.length);
    });
  });

  describe('returnProduct', async () => {
    it("Should return product", async () => {
      await ownerConn.addProduct('sugar', 1000, 1);
      const balanceBeforePurchase = await secondClientConn.getClientBalance(secondClient.address);

      expect(secondClientConn.buyProduct('sugar', 1, transaction('0.000000000000000001')))
      const balanceAfterPurchase = await secondClientConn.getClientBalance(secondClient.address);
      expect(balanceAfterPurchase).to.be.above(balanceBeforePurchase);

      await expect(secondClientConn.returnProduct('sugar'))
      .to.emit(secondClientConn, 'ProductEvent').withArgs('UPDATE')
      .to.emit(secondClientConn, 'PurchaseEvent').withArgs('DELETE');
      const balanceAfterRefund = await secondClientConn.getClientBalance(secondClient.address);
      expect(balanceBeforePurchase).to.be.equal(balanceAfterRefund);
    });
    
    it("Should revert if user doesn't have the product", async () => {
      await expect(clientConn.returnProduct('watermelon'))
      .to.be.revertedWithCustomError(ownerConn, "ProductNotPresent");
    });

    it("Should revert block time has expired", async () => {
      const balanceBeforePurchase = await clientConn.provider.getBalance(client.address);

      await ownerConn.addProduct('lime', 1000, 5);
      await clientConn.buyProduct('lime', 1, transaction('0.000000000000000005'));

      await mineNBlocks(100);
      await expect(clientConn.returnProduct('lime'))
      .to.be.revertedWithCustomError(ownerConn, "ExpiredReturnTime");
      const balanceAfterPurchase = await clientConn.provider.getBalance(client.address);

      expect(balanceBeforePurchase).to.be.above(balanceAfterPurchase);
    });
  });

  describe('clientsHaveBoughtProducts', async () => {
    it('Should get clients who have ever bought products', async () => {
      expect(await clientConn.clientsHaveBoughtProducts())
      .to.deep.equal([client.address, owner.address, secondClient.address]);
    });
  });
});
