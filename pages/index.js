import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { PixieAddress } from "./../config";
import Pixie from "./../artifacts/contracts/Pixie.sol/Pixie.json";
import lighthouse from "@lighthouse-web3/sdk";
import Header from "../public/components/header";
import BasicTabs from "../public/components/mainTabs";

export default function Home() {
  async function createFile(cid) {
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
      // let cid = await uploadToIPFS(file);
      // let cid = "QmZFVBso6HAcJ5pD5CVRizpLuoQQcJQxER9gw3duWeHMoy";
      let createFile = await pixie.createFile(cid);
      console.log("File created ", createFile);
    } catch (error) {
      console.log("error while creating file ", error);
    }
  }
  const encryptionSignature = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return {
      signedMessage: signedMessage,
      publicKey: address,
    };
  };
  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const deployEncrypted = async (e) => {
    console.log(e);
    // return;
    const sig = await encryptionSignature();
    let cid;
    try {
      const response = await lighthouse.uploadEncrypted(
        e,
        sig.publicKey,
        process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY,
        sig.signedMessage,
        progressCallback
      );
      /*
      output:
        {
          Name: "c04b017b6b9d1c189e15e6559aeb3ca8.png",
          Size: "318557",
          Hash: "QmcuuAtmYqbPYmPx3vhJvPDi61zMxYvJbfENMjBQjq7aM3"
        }
      Note: Hash in response is CID.
    */
      console.log("CID", response.Hash);
      cid = response.Hash;
    } catch (error) {
      console.log("error while uploading to lighthouse");
      return;
    }
    await createFile(cid);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Pixie</title>
        <meta
          name="description"
          content="Share your files securely over blockchains"
        />
      </Head>
      <Header></Header>
      <h1 className={styles.title}>Welcome to Pixie</h1>
      <div>
        <h1>Upload an File</h1>
        <input onChange={(e) => deployEncrypted(e)} type="file" />
      </div>
      <BasicTabs />
    </div>
  );
}
