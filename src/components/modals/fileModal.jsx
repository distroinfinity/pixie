import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  ModalFooter,
  Heading,
  VStack,
  HStack,
  Box,
  Image,
} from "@chakra-ui/react";
import TimestampDisplay from "../dateTime";
import lighthouse from "@lighthouse-web3/sdk";
import { UnlockIcon, CloseIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";

export const FileModal = ({ file, isOpen, onOpen, onClose }) => {
  const [fileURL, setFileURL] = useState(null);

  useEffect(() => {
    console.log("file id is", file);
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
  async function revokeFileAccess(cid, from) {
    console.log("testing", cid, from);
    const res = await lighthouse.revokeFileAccess();
    // TODO Remove entry from polybase db to
    console.log("Access Revoked from", from);
  }
  return (
    <>
      {/* <Button onClick={onOpen}>Open Modal</Button> */}

      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader size="xl"></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <Box>
                <Text fontSize="2xl">Title: {file?.name}</Text>
                <Text fontSize="xl">CID: {file?.cid}</Text>
                <Text fontSize="2xl">OnChainId: {file?.id}</Text>
                <Text>
                  <TimestampDisplay
                    timestamp={file?.timeCreated}
                  ></TimestampDisplay>
                </Text>
                <br></br>
                <br></br>
                <Text fontSize="2xl">Shared with:</Text>
                {file?.sharedWith?.length == 0 ? (
                  <Text>Not shared with anybody yet</Text>
                ) : (
                  ""
                )}
                {file?.sharedWith?.map((address, index) => {
                  return (
                    <HStack>
                      <Text key={index} margin="10px">
                        {index}. {address}
                      </Text>
                      <Button
                        size="xs"
                        onClick={() => {
                          revokeFileAccess(file?.cid, address);
                        }}
                      >
                        Revoke Access
                      </Button>
                    </HStack>
                  );
                })}
              </Box>
              <VStack>
                <Image
                  src={fileURL ? fileURL : "./images/locked.png"}
                  alt="locked"
                  borderRadius="lg"
                  boxSize="90%"
                />
                <Button variant="solid" colorScheme="blue" onClick={unlock}>
                  Unlock <UnlockIcon marginLeft="4px" />
                </Button>
              </VStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            {/* <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
