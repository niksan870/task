// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Owner', () => {
  let ownableContract, ownerConn, owner, client;

  before(async () => {
    ownableContract = await ethers.getContractFactory('Owner');
    ownerConn = await ownableContract.deploy();
    [owner,, client, ] = await ethers.getSigners();
  })

  describe('getOwner', async () => {
    it('Should the set owner', async () => {
        expect(await ownerConn.getOwner()).to.equal(owner.address);
    });
  });

  describe('changeOwner', async () => {
    it('Should change the owner', async () => {
        await ownerConn.changeOwner(client.address);
        
        const clientInstance = ownerConn.connect(client);
        expect(await clientInstance.getOwner()).to.equal(client.address);

        await clientInstance.changeOwner(owner.address)
        expect(await ownerConn.getOwner()).to.equal(owner.address);
      });
  });
});
