import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardBody,
  Stack,
  Heading,
  Text,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Image,
  useDisclosure,
  Spinner,
  Skeleton,
  Alert,
  AlertIcon,
  CloseButton,
  useToast,
  Box,
} from "@chakra-ui/react";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import Share from "./modals/share";
import { Polybase } from "@polybase/client";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import { useRouter } from "next/router";

const db = new Polybase({
  defaultNamespace:
    "pk/0x326b3a6fb1871737ec1f73662e3b3f51e797010027f66fc840a6b4dfe2de4d1511bf14c0e1b64b878886be17ba3a855b0dbdf2cd1d3962b6ebb7c25beb124e6b/pixie3",
});

const FileCard = ({ fileId, share }) => {
  const router = useRouter();
  const [unlocking, setUnlocking] = useState(false);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const toast = useToast();
  const toastRef = useRef();

  function handleClick() {
    if (!showToast) {
      setShowToast(true);
      toastRef.current = toast({
        title: "Unauthorized Access",
        description: "You are not authorized to access this file.",
        status: "error",
        duration: 4000,
        isClosable: true,
        onClose: handleClose,
      });
    }
  }

  function handleClose() {
    setShowToast(false);
  }

  async function loadFile() {
    if (!fileId) return;
    let file = await db.collection("Files").record(fileId).get();
    // console.log("fetched file", file.data);
    setFile(file.data);
  }

  useEffect(() => {
    loadFile();
  }, []);

  const sign_auth_message = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return { publicKey: publicKey, signedMessage: signedMessage };
  };

  /* Decrypt file */
  const decrypt = async (cid) => {
    if (!cid) return;
    setUnlocking(true);
    try {
      const { publicKey, signedMessage } = await sign_auth_message();
      // console.log(publicKey, signedMessage);
      /*
      fetchEncryptionKey(cid, publicKey, signedMessage)
        Parameters:
          CID: CID of the file to decrypt
          publicKey: public key of the user who has access to file or owner
          signedMessage: message signed by the owner of publicKey
    */
      const keyObject = await lighthouse.fetchEncryptionKey(
        cid,
        publicKey,
        signedMessage
      );

      // Decrypt file
      /*
      decryptFile(cid, key, mimeType)
        Parameters:
          CID: CID of the file to decrypt
          key: the key to decrypt the file
          mimeType: default null, mime type of file
    */

      const fileType = "image/jpeg";
      const decrypted = await lighthouse.decryptFile(
        cid,
        keyObject.data.key,
        fileType
      );
      // console.log(decrypted);
      /*
      Response: blob
    */

      // View File
      const url = URL.createObjectURL(decrypted);
      console.log("file url", url);
      setFileURL(url);
    } catch (error) {
      console.log("error while unlocking", error);
      handleClick();
    }

    setUnlocking(false);
  };

  async function unlock() {
    if (!file) return;
    console.log("unlock started for ", file);
    decrypt(file.cid);
  }
  async function openFilePage() {
    console.log("pressing file ", fileId);
    router.push(`./files/${fileId}`);
    // onOpen(true);
  }

  return (
    <>
      <Card maxW="sm">
        <CardBody
          onClick={() => {
            openFilePage();
          }}
        >
          <Image
            src={fileURL ? fileURL : "./images/locked.png"}
            alt="locked"
            borderRadius="lg"
          />
          {showToast && (
            <Box position="absolute" top={4} right={4} zIndex={999}>
              {toastRef.current}
            </Box>
          )}
          <Skeleton isLoaded={file}>
            <Stack mt="6" spacing="3">
              <Heading size="md">
                {!file?.name && "[File Name]"}
                {file?.name.substring(0, 14)}{" "}
                {file?.name.length > 14 ? "..." : ""}
              </Heading>
            </Stack>
          </Skeleton>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing="2">
            <Button
              variant="solid"
              colorScheme="blue"
              onClick={unlock}
              isLoading={unlocking}
              loadingText="Unlocking"
            >
              Locked <LockIcon marginLeft="4px" />
            </Button>
            {share ? "" : <Share fileid={file?.id} cid={file?.cid} />}
          </ButtonGroup>
        </CardFooter>
      </Card>
    </>
  );
};

export default FileCard;
