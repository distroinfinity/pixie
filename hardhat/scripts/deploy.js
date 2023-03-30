const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Pixie = await hre.ethers.getContractFactory("Pixie");
  const pixie = await Pixie.deploy();

  await pixie.deployed();

  console.log(`Pixie deployed  to ${pixie.address}`);
  fs.writeFileSync(
    "./config.js",
    `export const PixieAddress = "${pixie.address}"`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
