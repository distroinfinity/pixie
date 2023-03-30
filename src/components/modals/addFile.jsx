import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import DragAndDrop from "../dragAndDrop";
import { useDisclosure } from "@chakra-ui/react";
import { Polybase } from "@polybase/client";
import { AddIcon } from "@chakra-ui/icons";
import { PixieAddress } from "./../../../hardhat/config";
import Pixie from "./../../../hardhat/artifacts/contracts/Pixie.sol/Pixie.json";
import lighthouse from "@lighthouse-web3/sdk";
import { User_data } from "@/contexts/userContexts";
import { useRouter } from "next/router";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

function AddFile({ setFiles }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [captureEvent, setCaptureEvent] = useState(null);
  const { user, setUser } = useContext(User_data);
  const router = useRouter();

  useEffect(() => {
    console.log("user at add file modal", user);
    if (!user) {
      console.log("You are not signed in");
      router.push("/");
      return;
    }
  }, []);

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
    console.log("added file to specific user table", recordData.data);
    setFiles(recordData.data.files);
    console.log("user in add file", user.data);
    // setUser(user.data);
    onClose(true);
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
    const fileName = file.Name;
    const time = Date.now();
    // const address = user.id;
    await addToPolybase(createdFileId, fileName, cid, time, user.id);
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
  const deployEncrypted = async () => {
    // 1. Upload encrypted file to lighthouse

    console.log("captures event is", captureEvent);
    // return;
    const sig = await encryptionSignature();
    console.log("signature", sig);
    let file;
    try {
      const response = await lighthouse.uploadEncrypted(
        captureEvent,
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
      console.log("uploaded file data to lighhouse", response.data);
      file = response.data;
    } catch (error) {
      console.log("error while uploading to lighthouse");
      return;
    }
    await createFile(file);
  };

  function upload() {
    deployEncrypted();
  }

  return (
    <>
      <Button
        onClick={onOpen}
        rounded={"4px"}
        bg={"#C0DEFF"}
        margin={"50px"}
        border={"1px solid rgba(255, 255, 255, 0.1)"}
        fontSize={"20px"}
        fontWeight={"normal"}
        _hover={{
          background: "rgba(255, 255, 255, 0.02)",
          boxShadow: "0px 1px 12px rgba(255,255,255,0.05)",
        }}
        _active={{}}
      >
        <AddIcon /> Add file
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload a new file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Text>
              guusldcgvlyuidgcviluegvilergvliegvilsergvilsdfgvilergvilswedgabvhyjlasdgc
              a wsc gwedi ]wdsvgiawv
            </Text> */}
            <DragAndDrop
              captureEvent={captureEvent}
              setCaptureEvent={setCaptureEvent}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={upload}>
              Upload
            </Button>
            {/* <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddFile;