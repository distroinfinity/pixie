import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton, Button } from "web3uikit";
import { ethers } from "ethers";

import { PixieAddress } from "./../config";
import Pixie from "./../artifacts/contracts/Pixie.sol/Pixie.json";

export default function Home() {
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
    }
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
  async function createFile() {
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
      let createFile = await pixie.createFile();
      console.log("File created ", createFile);
    } catch (error) {
      console.log("error while creating User ", error);
    }
  }
  async function getMyFiles() {
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
      let getFiles = await pixie.getFiles();
      console.log("Files fetched ", typeof getFiles, getFiles);
    } catch (error) {
      console.log("error while fetching Files ", error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Pixie</title>
        <meta
          name="description"
          content="Share your files securely over blockchains"
        />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Pixie</h1>

        <div className={styles.grid}>
          <ConnectButton />
          <div>
            <Button onClick={createUser} text="Create User" />
            <Button onClick={getUser} text="Get User" />
          </div>
          <div>
            <Button onClick={createFile} text="Create File" />
            <Button onClick={getMyFiles} text="Get MY File" />
          </div>
        </div>
      </main>
    </div>
  );
}
