// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { transaction, mineNBlocks } = require('./utils');


describe('Store', () => {
  let ownerConn, owner, client, clientConn, secondClient, secondClientConn;

  before(async () => {
    const storeContract = await ethers.getContractFactory('Store');
    ownerConn = await storeContract.deploy();
    [owner,, client, secondClient] = await ethers.getSigners();
    clientConn = ownerConn.connect(client);
    secondClientConn = ownerConn.connect(secondClient);
    const EventContract = await ethers.getContractFactory("Events");
    events = await EventContract.deploy();
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

    it('Should buy products', async () => {
      const productName = 'melon';
      let clientsBeforeFirstPurchase = await ownerConn.getClientsHaveEverBougthAProduct(productName);
      await ownerConn.addProduct(productName, 1000, 1);

      await expect(ownerConn.buyProduct(productName, 1, transaction('0.000000000000000001')))
      .to.emit(events.attach(ownerConn.address), 'SellProduct').withArgs(productName, 1)
      .to.emit(events.attach(ownerConn.address), 'MakeOrder').withArgs(owner.address, productName, 1, 1);

      let clientsAfterFirstPurchase = await ownerConn.getClientsHaveEverBougthAProduct(productName);
      expect(clientsBeforeFirstPurchase.length).to.be.below(clientsAfterFirstPurchase.length);
    });
  });

  describe('returnProduct', async () => {
    it("Should return product", async () => {
      const productName = 'sugar';
      await ownerConn.addProduct(productName, 1000, 1);
    
      const balanceBeforePurchase = await secondClientConn.getClientBalance(client.address);

      expect(clientConn.buyProduct(productName, 1, transaction('0.000000000000000001')));
      const balanceAfterPurchase = await clientConn.getClientBalance(client.address);
      expect(balanceAfterPurchase).to.be.above(balanceBeforePurchase);


      await expect(clientConn.returnProduct(productName))
      .to.emit(events.attach(clientConn.address), 'ReturnProduct').withArgs(productName, 1000)
      .to.emit(events.attach(clientConn.address), 'DiscardOrder').withArgs(client.address, productName, 1, 1);

      const balanceAfterRefund = await secondClientConn.getClientBalance(client.address);
      expect(balanceBeforePurchase).to.be.equal(balanceAfterRefund);
    });
    
    it("Should revert if user doesn't have the product", async () => {
      await expect(clientConn.returnProduct('watermelon'))
      .to.be.revertedWithCustomError(ownerConn, "ProductNotPresent");
    });

    it("Should revert block time has expired", async () => {
      const productName = 'lime';
      const balanceBeforePurchase = await clientConn.provider.getBalance(client.address);

      await ownerConn.addProduct(productName, 1000, 5);
      await clientConn.buyProduct(productName, 1, transaction('0.000000000000000005'));

      await mineNBlocks(100);
      await expect(clientConn.returnProduct(productName))
      .to.be.revertedWithCustomError(ownerConn, "ExpiredReturnTime");
      const balanceAfterPurchase = await clientConn.provider.getBalance(client.address);

      expect(balanceBeforePurchase).to.be.above(balanceAfterPurchase);
    });
  });

  describe('getClientsHaveEverBougthAProduct', async () => {
    it('Should get clients who have ever bought a product', async () => {
      const productName = 'peach';
      await ownerConn.addProduct(productName, 1000, 1);

      await expect(ownerConn.buyProduct(productName, 1, transaction('0.000000000000000001')))
      .to.emit(events.attach(ownerConn.address), 'SellProduct').withArgs(productName, 1)
      .to.emit(events.attach(ownerConn.address), 'MakeOrder').withArgs(owner.address, productName, 1, 1);

      await expect(clientConn.buyProduct(productName, 1, transaction('0.000000000000000001')))
      .to.emit(events.attach(clientConn.address), 'SellProduct').withArgs(productName, 1)
      .to.emit(events.attach(clientConn.address), 'MakeOrder').withArgs(client.address, productName, 1, 1);
      await clientConn.returnProduct(productName);

      expect(await clientConn.getClientsHaveEverBougthAProduct(productName))
      .to.deep.equal([owner.address, client.address]);
    });
  });
});
