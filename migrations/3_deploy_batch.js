const Deposit = artifacts.require("DepositContract");
const BatchDeposit = artifacts.require("BatchDeposit");

module.exports = function (deployer) {
  deployer.deploy(BatchDeposit, Deposit.address);
};
