import React, { useState } from "react";
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
  Input,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import lighthouse from "@lighthouse-web3/sdk";
import { Polybase } from "@polybase/client";
import { ethers } from "ethers";

import { useDisclosure } from "@chakra-ui/react";
import { HiShare } from "react-icons/hi";
const db = new Polybase({
  defaultNamespace:
    "pk/0xc8d8ca343f4873ad9d2500bc1cc6ad9b894a581c1e40183c7fff391a4c0e3e3512decaf6525c99bbac2ced536e2d7f1c51ac9957b3b9d27dafbfb2158a4dd06e/pixie-deploy",
});

function Share({ fileid, cid }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [address, setAddress] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { hasCopied, onCopy } = useClipboard(`http://localhost:3000/files/${fileid}`);
  const toast = useToast();

  function isValidEthereumAddress(address) {
    if (/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // Check if it has the basic requirements of an address
      return true;
    } else {
      // Otherwise, return false
      return false;
    }
  }
  const handleChange = (event) => {
    const inputAddress = event.target.value;
    setAddress(inputAddress);
    setIsValid(isValidEthereumAddress(inputAddress));
  };

  const signAuthMessage = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return { publicKey: publicKey, signedMessage: signedMessage };
  };

  const shareFile = async (shareTo) => {
    if (!shareTo) {
      console.log("no address found to share with", address);
      return;
    }
    shareTo = shareTo.toLowerCase();
    setSharing(true);

    // Then get auth message and sign
    // Note: message should be signed by owner of file.
    const { publicKey, signedMessage } = await signAuthMessage();
    // console.log("shareTo", shareTo, cid, fileid, publicKey, signedMessage);
    try {
      const res = await lighthouse.shareFile(
        publicKey,
        [shareTo],
        cid,
        signedMessage
      );

      // console.log(res);
    } catch (error) {
      console.log("Error while sharing access", error);
    }

    // add to shared with me polybase
    // 1. Add shared with to file
    const fileRecordRes = await db
      .collection("Files")
      .record(fileid)
      .call("shareWith", [shareTo]);
    console.log("added sharedwith to specific file table", fileRecordRes);

    // 2. Add file shared with me to the user

    let user;
    try {
      // check is user exists in db
      user = await db.collection("User").record(shareTo).get();
      console.log("User Already exists", user);
    } catch (e) {
      // .create() accepts two params, address and name of user
      // populate these dynamically with address and name of user
      user = await db.collection("User").create([shareTo, "Yash-TestName"]);
      console.log("User created", user);
    }

    const recordData = await db
      .collection("User")
      .record(shareTo)
      .call("shared", [fileid]);
    console.log("added fileis to specific userSharedwith table", recordData);
    // console.log("fileshared successfully");
    setSharing(false);
    onClose(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Do something with the valid Ethereum address
    // console.log("entered address", address);
    shareFile(address);
  };
  const handleCopyClick = () => {
    onCopy();
    toast({
      title: "Link copied",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <>
      <Button variant="ghost" colorScheme="blue" onClick={onOpen}>
        Share <HiShare marginleft="4px" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text m="10px">
              Enter wallet address of the person you want to share the file with
            </Text>
            <Input
              isInvalid={!isValid}
              errorBorderColor="crimson"
              onChange={handleChange}
              value={address}
              placeholder="Enter address"
            />
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={!isValid}
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={sharing}
              loadingText="Sharing..."
            >
              Share
            </Button>
            <Button onClick={handleCopyClick}>
              {hasCopied ? "Copied!" : "Copy Link"}
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Share;
