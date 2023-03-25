import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { PixieAddress } from "./../config";
import Pixie from "./../artifacts/contracts/Pixie.sol/Pixie.json";
import lighthouse from "@lighthouse-web3/sdk";
import Header from "../public/components/header";
import BasicTabs from "../public/components/mainTabs";
import { useEffect, useState } from "react";
import { Polybase } from "@polybase/client";
import { Auth } from "@polybase/auth";
import { Button } from "@mui/material";
import { useContext } from "react";
import { User_data } from "../public/contexts/userContexts";
import { useRouter } from "next/router";

const auth = typeof window !== "undefined" ? new Auth() : null;

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

export default function Home() {
  const { user, setUser } = useContext(User_data);

  async function signIn() {
    const authState = await auth.signIn();
    console.log("signed in", authState);
    // get public
    let publicKey = authState.userId;

    if (!publicKey) {
      publicKey = await getPublicKey();
    }

    // Create user if not exists
    let user;
    try {
      user = await db.collection("User").record(publicKey).get();
      console.log("User Already exists");
    } catch (e) {
      // .create() accepts two params, address and name of user
      // populate these dynamically with address and name of user
      user = await db.collection("User").create([publicKey, "TestName - Yash"]);
      console.log("New User created");
    }

    console.log("user is ", user.data);
    setUser(user.data);
    // setSignIn(true);
    return;
  }

  async function signOut() {
    const authState = await auth.signOut();
    console.log("singed out", authState);
    setUser(null);
  }

  function sendData() {
    var data = document.getElementById("context_id").value;
    setMessage(data);
  }

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
    console.log("user signed in as", user);
    //getCurrentFileId();
  }, [user]);

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
    // const address = user.id;
    await addToPolybase(createdFileId, fileName, cid, time, user.id);
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
      {/* <header>
        <div className="bg-indigo-100  py-8 flex">
          <div
            onClick={() => router.push("/")}
            className="mx-16 font-bold text-xl text-gray-600 cursor-pointer"
          >
            first component
          </div>
          <div
            onClick={() => router.push("/share")}
            className="mx-2 text-xl font-bold text-gray-600 cursor-pointer"
          >
            second component
          </div>
        </div>
      </header> */}
      {/* <section>
        <div className="py-8 px-16">
          <h1> Shared value is {message}</h1>
          <h1 className="text-xl text-gray-600 my-4">
            Enter your content to pass another component
          </h1>
          <input
            type="text"
            id="context_id"
            className="border rounded border-gray-600 py-1 w-96"
          ></input>
          <div>
            <button
              onClick={() => sendData()}
              className="w-fit border bg-green-600 text-white py-1 px-4 rounded font-bold my-4 hover:bg-green-700
                cursor-pointer"
            >
              send
            </button>{" "}
          </div>
        </div>
      </section> */}
      <Header></Header>
      <h1 className={styles.title}>Welcome to Pixie</h1>

      <div style={{ display: "flex" }}>
        {user && (
          <div>
            <h1>Upload an File</h1>
            <input onChange={(e) => deployEncrypted(e)} type="file" />
          </div>
        )}

        <div>
          {user == undefined ? (
            <Button variant="outlined" onClick={signIn}>
              Sign In
            </Button>
          ) : (
            <Button variant="outlined" onCLick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
      </div>
      {user ? <BasicTabs /> : ""}
    </div>
  );
}
