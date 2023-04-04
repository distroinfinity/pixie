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
    "pk/0xc8d8ca343f4873ad9d2500bc1cc6ad9b894a581c1e40183c7fff391a4c0e3e3512decaf6525c99bbac2ced536e2d7f1c51ac9957b3b9d27dafbfb2158a4dd06e/pixie-deploy",
});

function AddFile({ setFiles }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [captureEvent, setCaptureEvent] = useState(null);
  const { user, setUser } = useContext(User_data);
  const [encrypting, setEncrypting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // console.log("user at add file modal", user);
    if (!user) {
      console.log("You are not signed in");
      // router.push("/");
      return;
    }
  }, []);

  async function addToPolybase(createdFileId, fileName, cid, time, address) {
    let file;
    file = await db
      .collection("Files")
      .create([createdFileId, fileName, cid, time, address]);
    console.log("File added to polybase");

    // add fileId to user table
    let id = file.data.id;

    // let user;
    // try {
    //   // check is user exists in db
    //   user = await db.collection("User").record(address).get();
    //   console.log("User Already exists", user);
    // } catch (e) {
    //   // .create() accepts two params, address and name of user
    //   // populate these dynamically with address and name of user
    //   user = await db.collection("User").create([address, "Yash-TestName"]);
    //   console.log("User created", user);
    // }

    const userId = address;

    const recordData = await db
      .collection("User")
      .record(userId)
      .call("addFiles", [id]);
    console.log("added file to specific user table", recordData.data);
    setFiles(recordData.data.files);
    // setUser(user.data);
    onClose(true);
  }

  async function createFile(file) {
    console.log("uploading on chain file data");

    if (!file.Hash) {
      console.log("CID not found");
      return;
    }

    // Store CID, fileID and other details to polybase db
    // ⚠️ not a good practice, improve this
    // just store fileId and owner on chain, link db and chain via fileId

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);
    let tx = await pixie.createFile();
    const receipt = await tx.wait();

    const events = receipt.events.filter(
      (event) => event.event === "fileCreated"
    );
    const createdFileId = parseInt(events[0].topics[1]);

    console.log("File created with id", createdFileId);

    // fetch file id properly
    const cid = file.Hash;
    const fileName = file.Name;
    const time = Date.now();
    // const address = user.id;
    await addToPolybase(createdFileId.toString(), fileName, cid, time, user.id);
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
    // console.log(percentageDone);
  };
  const deployEncrypted = async () => {
    setEncrypting(true);
    // 1. Upload encrypted file to lighthouse

    // return;
    const sig = await encryptionSignature();
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
    // let file = {
    //   Name: "secretImage.png",
    //   Hash: "QmTzeXzfy2RXhQ7ReYKozNmtN1ENLqzSzbdhUa1YJVVV5Z",
    //   Size: "270877",
    // };
    await createFile(file);
    setEncrypting(false);
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
        <AddIcon marginRight="4px" /> Add file
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload a new file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DragAndDrop
              captureEvent={captureEvent}
              setCaptureEvent={setCaptureEvent}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={encrypting}
              loadingText="Uploading..."
              colorScheme="blue"
              mr={3}
              onClick={upload}
              isDisabled={!captureEvent}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddFile;
