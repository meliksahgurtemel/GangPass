const GangPass = artifacts.require('GangPass');

module.exports = async function (deployer) {
  await deployer.deploy(GangPass);
};