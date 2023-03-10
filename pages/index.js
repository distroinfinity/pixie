import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton, Button } from "web3uikit";
import { ethers } from "ethers";

import { PixieAddress } from "./../config";
import Pixie from "./../artifacts/contracts/Pixie.sol/Pixie.json";

export default function Home() {
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
      let createFile = await pixie.createUser();
      console.log("User created ", createFile);
    } catch (error) {
      console.log("error while creating User", error);
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
          <Button onClick={createFile} text="Create User" />
        </div>
      </main>
    </div>
  );
}
