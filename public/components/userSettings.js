import React from "react";
import { Button } from "web3uikit";
import { ethers } from "ethers";
import { PixieAddress } from "./../../config";
import Pixie from "./../../artifacts/contracts/Pixie.sol/Pixie.json";

const UserSettings = () => {
  async function createUser() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();

    const signer = provider.getSigner();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);

    try {
      let createUser = await pixie.createUser();
      console.log("User created ", createUser);
    } catch (error) {
      console.log("error while creating User", error);
      return
    }

    // add to polybase
    
  }
  async function getUser() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner();
    // console.log("signer address is", await signer.getAddress());

    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);

    try {
      let getUser = await pixie.getUser(await signer.getAddress());
      console.log("User fetched ", getUser);
    } catch (error) {
      console.log("error while fetching User ", error);
    }
  }
  return (
    <div>
      <div>
        <Button onClick={createUser} text="Create User" />
        <Button onClick={getUser} text="Get User" />
      </div>
    </div>
  );
};

export default UserSettings;
