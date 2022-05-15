const MetaverseNFT721 = artifacts.require("MetaverseNFT721");
const MetaverseVendingMachine = artifacts.require("MetaverseVendingMachine");

Web3 = require("web3");

module.exports = function (deployer) {
  
  deployer.deploy(MetaverseNFT721).then(function () {
    return deployer.deploy(MetaverseVendingMachine, MetaverseNFT721.address);
  });

  const MINTER_ROLE = web3.utils.keccak256("MINTER_ROLE");
  const VENDING_MACHINE_ROLE = web3.utils.keccak256("VENDING_MACHINE_ROLE");

  deployer.then( async () => {
    const metaverseInstance = await MetaverseNFT721.deployed();
    const walletInstance = await MetaverseVendingMachine.deployed();

    await metaverseInstance.grantRole(MINTER_ROLE, walletInstance.address);
    await metaverseInstance.grantRole(VENDING_MACHINE_ROLE, walletInstance.address);
  });
};
