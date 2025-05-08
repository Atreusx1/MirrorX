const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MirrorPost = await hre.ethers.getContractFactory("MirrorPost");
  const mirrorPost = await MirrorPost.deploy();
  
  // Wait for the contract to be mined and deployed
  await mirrorPost.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await mirrorPost.getAddress();
  console.log("MirrorPost deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});