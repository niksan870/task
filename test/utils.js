const transaction = (ethAmount) => {
    const weiAmount = ethers.utils.parseEther(ethAmount);
    return {value: weiAmount};
} 

const mineNBlocks = async (n) => {
    for (let index = 0; index < n; index++) {
      await ethers.provider.send('evm_mine');
    }
}
  
module.exports = { transaction, mineNBlocks };