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
} from "@chakra-ui/react";
import lighthouse from "@lighthouse-web3/sdk";
import { Polybase } from "@polybase/client";
import { ethers } from "ethers";

import { useDisclosure } from "@chakra-ui/react";
import { HiShare } from "react-icons/hi";

const db = new Polybase({
  defaultNamespace: "pk/0x326b3a6fb1871737ec1f73662e3b3f51e797010027f66fc840a6b4dfe2de4d1511bf14c0e1b64b878886be17ba3a855b0dbdf2cd1d3962b6ebb7c25beb124e6b/pixie3",
});

function Share({ fileid, cid }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [address, setAddress] = useState("");
  const [isValid, setIsValid] = useState(false);

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
    // Then get auth message and sign
    // Note: message should be signed by owner of file.
    const { publicKey, signedMessage } = await signAuthMessage();
    console.log("shareTo", shareTo, cid, fileid, publicKey, signedMessage);

    try {
      const res = await lighthouse.shareFile(
        publicKey,
        [shareTo],
        cid,
        signedMessage
      );

      console.log(res);
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
    console.log("fileshared successfully");
    onClose(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Do something with the valid Ethereum address
    console.log("entered address", address);
    shareFile(address);
  };

  return (
    <>
      <Button variant="ghost" colorScheme="blue" onClick={onOpen}>
        Share <HiShare marginleft="4px" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
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
            >
              Share
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Share;
