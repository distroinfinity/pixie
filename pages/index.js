import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { PixieAddress } from "./../config";
import Pixie from "./../artifacts/contracts/Pixie.sol/Pixie.json";
import lighthouse from "@lighthouse-web3/sdk";
import Header from "../public/components/header";
import BasicTabs from "../public/components/mainTabs";
import { useEffect } from "react";

import { Polybase } from "@polybase/client";
import { useCollection } from "@polybase/react";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

export default function Home() {
  async function getCurrentFileId() {
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
      let id = await pixie.getCurrentFileId();
      console.log("file id current  ", id.toString() - 1);

      return (id.toString() - 1).toString();
    } catch (error) {
      console.log("error while fetching file id ", error);
    }
  }
  useEffect(() => {
    //getCurrentFileId();
  }, []);

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
  async function addToPolybase(createdFileId, fileName, cid, time, address) {
    let file;
    console.log("input", createdFileId, fileName, cid, time);
    file = await db
      .collection("Files")
      .create([createdFileId, fileName, cid, time]);
    console.log("File created", file);

    // add fileId to user table
    let id = file.data.id;

    let user;
    try {
      // check is user exists in db
      user = await db.collection("User").record(address).get();
      console.log("User Already exists", user);
    } catch (e) {
      // .create() accepts two params, address and name of user
      // populate these dynamically with address and name of user
      user = await db.collection("User").create([address, "Yash-TestName"]);
      console.log("User created", user);
    }

    const userId = user.data.id;

    const recordData = await db
      .collection("User")
      .record(userId)
      .call("addFiles", [id]);
    console.log("added file to specific user table", recordData);
  }

  async function createFile(file) {
    console.log("uploading on chain file data", file);

    if (!file.Hash) {
      console.log("CID not found");
      return;
    }

    // Store CID, fileID and other details to polybase db
    // ⚠️ not a good practice, improve this
    // just store fileId and owner on chain, link db and chain via fileId

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);
    let createFile = await pixie.createFile();
    console.log("File created ", createFile);

    // store file details on polybase
    const createdFileId = await getCurrentFileId();
    const cid = file.Hash;
    const fileName = "testFileName";
    const time = Date.now();
    await addToPolybase(createdFileId, fileName, cid, time, address);
  }
  const deployEncrypted = async (e) => {
    // 1. Upload encrypted file to lighthouse

    console.log(e);
    // return;
    const sig = await encryptionSignature();
    let file;
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
      console.log("uploaded file data1", response.data);
      file = response.data;
    } catch (error) {
      console.log("error while uploading to lighthouse");
      return;
    }
    await createFile(file);
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
