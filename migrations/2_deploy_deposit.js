const Deposit = artifacts.require("DepositContract");

module.exports = function (deployer) {
  deployer.deploy(Deposit);
};
