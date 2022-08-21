# TechnoLime Store

Requirements:
- The administrator (owner) of the store should be able to add new products and the quantity of them.
- The administrator should not be able to add the same product twice, just quantity.
- Buyers (clients) should be able to see the available products and buy them by their id.
- Buyers should be able to return products if they are not satisfied (within a certain period in blocktime: 100 blocks).
- A client cannot buy the same product more than one time.
- The clients should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)
- Everyone should be able to see the addresses of all clients that have ever bought a given product.


Intro:
- I used dedicated files for each contract. 
- Since the contracts were small I didn't see the point of using interfaces. 
- Kept each contract logically separate so it's more modular and reduced data coupling as much as possible.
- Performance wise I sticked to the best practices I learned from the playlist in section 3.
- At the end I ran a gas report with nice overiview of it's overall gas efficiency.

Useful commands:

```shell
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

Gas Report:

In order to activate it you must set an environmental variable ```export GAS_REPORT=true ``` and report will appear at the end of each test


![image](https://user-images.githubusercontent.com/30548703/185501086-78f7071e-fd60-4183-936e-0af5c77399ad.png)

