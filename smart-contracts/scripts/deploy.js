const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const MirrorPost = await hre.ethers.getContractFactory("MirrorPost");
  console.log("Deploying MirrorPost...");
  const mirrorPost = await MirrorPost.deploy();

  console.log("Waiting for deployment transaction to be mined...");
  await mirrorPost.deploymentTransaction().wait(1);
  
  const contractAddress = await mirrorPost.getAddress();
  console.log("MirrorPost deployed to:", contractAddress);
  
  // Verify the contract has code
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("Contract code exists:", code !== '0x');
  
  // If using the console to test, you might want to add a delay before exiting
  console.log("Deployment completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });