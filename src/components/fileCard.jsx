import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { UnlockIcon } from "@chakra-ui/icons";
import Share from "./modals/share";
import { Polybase } from "@polybase/client";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import TimestampDisplay from "./dateTime";
import Router, { useRouter } from "next/router";
const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});
import { FileModal } from "./modals/fileModal";

const FileCard = ({ fileId, share }) => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const router = useRouter();

  async function loadFile() {
    if (!fileId) return;
    let file = await db.collection("FilesTable").record(fileId).get();
    // console.log("fetched file", file.data);
    setFile(file.data);
  }

  useEffect(() => {
    loadFile();
  }, []);

  const sign_auth_message = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://rpc-mumbai.maticvigil.com"
    // );
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
    // Fetch file encryption key
    const { publicKey, signedMessage } = await sign_auth_message();
    console.log(publicKey, signedMessage);
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
    console.log(decrypted);
    /*
      Response: blob
    */

    // View File
    const url = URL.createObjectURL(decrypted);
    console.log("file url", url);
    setFileURL(url);
  };

  async function unlock() {
    if (!file) return;
    console.log("unlock started for ", file);
    decrypt(file.cid);
  }
  async function openFilePage() {
    console.log("opening individual file page", file);
    // router.push(`./files/${file.id}`);
    onOpen(true);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {file && (
        <FileModal
          file={file}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
        />
      )}

      <Card maxW="sm">
        <CardBody
          onClick={() => {
            onOpen(true);
          }}
        >
          <Image
            src={fileURL ? fileURL : "./images/locked.png"}
            alt="locked"
            borderRadius="lg"
          />
          <Stack mt="6" spacing="3">
            <Heading size="md">
              {!file?.name && "[File Name]"}
              {file?.name.substring(0, 14)}{" "}
              {file?.name.length > 14 ? "..." : ""}
            </Heading>
            {/* <Text>Sample test for description</Text> */}
            {/* <Text color="blue.600" fontSize="2xl">
            $450
          </Text> */}
            {/* <TimestampDisplay timestamp={file?.timeCreated} /> */}
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing="2">
            <Button variant="solid" colorScheme="blue" onClick={unlock}>
              Unlock <UnlockIcon marginLeft="4px" />
            </Button>
            {share ? "" : <Share fileid={file?.id} cid={file?.cid} />}
          </ButtonGroup>
        </CardFooter>
      </Card>
    </>
  );
};

export default FileCard;
