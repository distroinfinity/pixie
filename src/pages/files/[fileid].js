import { useEffect, useState, useContext } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  UnorderedList,
  ListItem,
  VStack,
  HStack,
  Link,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  CloseButton,
} from "@chakra-ui/react";
import Layout from "@/components/layout";
import MintPass from "@/components/modals/mintPass";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { NFT } from "web3uikit";
import NFTCard from "@/components/nftcard";

import TimestampDisplay from "./../../components/dateTime";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";
import { Polybase } from "@polybase/client";
import { PixieAddress } from "../../../hardhat/config";
import Pixie from "./../../../hardhat/artifacts/contracts/Pixie.sol/Pixie.json";
import { User_data } from "@/contexts/userContexts";
import { Auth } from "@polybase/auth";

const db = new Polybase({
  defaultNamespace:
    "pk/0xc8d8ca343f4873ad9d2500bc1cc6ad9b894a581c1e40183c7fff391a4c0e3e3512decaf6525c99bbac2ced536e2d7f1c51ac9957b3b9d27dafbfb2158a4dd06e/pixie-deploy",
});

const auth = typeof window !== "undefined" ? new Auth() : null;

function ImagePage({}) {
  const router = useRouter();

  const { user, setUser } = useContext(User_data);
  const [showAlert, setShowAlert] = useState(false);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [locked, setLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [tokensExist, setTokensExist] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const fileId = router.query.fileid;
    console.log("user and id at file page", user, fileId);

    if (!fileId) return;
    loadFile(fileId);
  }, [router.isReady]);
  async function checkIfPassExist(fileId) {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com"
    );

    // const signer = provider.getSigner();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    // const pixie = pixieContract.connect(signer);

    try {
      let fetchedFile = await pixieContract.getFile(fileId);
      console.log("file from smart contract  ", fetchedFile);
      if (fetchedFile.accessTokens) {
        setTokensExist(true);
      }
    } catch (error) {
      console.log("error while fetching file  ", error);
    }
  }
  async function loadFile(fileId) {
    let file = await db.collection("Files").record(fileId).get();
    // console.log("fetched file data", file.data);
    setFile(file.data);
    checkIfPassExist(fileId);
  }

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
      // Fetch file encryption key
      const { publicKey, signedMessage } = await sign_auth_message();
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
      setFileURL(url);
      setLocked(false);
    } catch (error) {
      setShowAlert(true);
      console.log("error while unlocking", error);
    }
    setUnlocking(false);
  };

  async function unlock() {
    if (!file) return;
    console.log("unlock started for ", file);
    decrypt(file.cid);
  }

  return (
    <Layout>
      <VStack justifyContent="center" alignItems="center">
        <HStack>
          <VStack>
            <Box
              boxSize="90%"
              // bgGradient="linear-gradient(to bottom right, #FF0000, #FFA500, #FFFF00, #008000, #0000FF, #4B0082, #EE82EE)"
              borderRadius="lg"
              boxShadow="inset 0 0 0 16px"
              overflow="hidden"
            >
              <Image
                src={fileURL ? fileURL : "/images/locked.png"}
                alt="locked"
              />
              {showAlert && (
                <Alert status="error">
                  <AlertIcon />
                  You are not authorized to access this file.
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={() => {
                      setShowAlert(false);
                    }}
                  />
                </Alert>
              )}
            </Box>
            <Button
              isLoading={unlocking}
              loadingText="Unlocking..."
              onClick={unlock}
              rounded={"4px"}
              bg={"#C0DEFF"}
              border={"1px solid rgba(255, 255, 255, 0.1)"}
              fontSize={"20px"}
              fontWeight={"normal"}
              _hover={{
                background: "rgba(255, 255, 255, 0.02)",
                boxShadow: "0px 1px 12px rgba(255,255,255,0.05)",
              }}
              _active={{}}
            >
              {locked == true ? (
                <>
                  Locked <LockIcon marginLeft="4px" />
                </>
              ) : (
                <>
                  Unlocked <UnlockIcon marginLeft="4px" />
                </>
              )}
            </Button>
          </VStack>
          <Box p={4} width="40%">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" mb={4}>
                {file?.name}
              </Text>
              <TimestampDisplay
                timestamp={file?.timeCreated}
              ></TimestampDisplay>

              <HStack justifyContent="space-between">
                <Text fontSize="md" mb={2}>
                  Owner:
                </Text>
                <Skeleton isLoaded={file}>
                  <Link
                    href={`https://etherscan.io/address/${PixieAddress}`}
                    isExternal
                    color="teal.500"
                  >
                    {file?.owner.substring(0, 5)}.....
                    {file?.owner.substring(
                      file?.owner.length - 6,
                      file?.owner.length
                    )}
                  </Link>
                </Skeleton>
              </HStack>
              <HStack justifyContent="space-between">
                <Text fontSize="md" mb={2}>
                  OnChainId:
                </Text>
                <Skeleton isLoaded={file}>
                  <Text>{file?.id}</Text>
                </Skeleton>
              </HStack>
              <HStack justifyContent="space-between" alignItems="baseline">
                <Text fontSize="md" mb={2}>
                  CID:
                </Text>
                <Skeleton isLoaded={file}>
                  <Text>
                    {file?.cid.substring(0, 5)}....
                    {file?.cid.substring(
                      file?.cid.length - 6,
                      file?.cid.length
                    )}
                  </Text>
                </Skeleton>
              </HStack>
            </Box>
            <VStack bg="gray.100" rounded="md" p="20px" boxSize="100%">
              {console.log("file id in nft", file?.id)}
              {tokensExist && (
                <>
                  <NFTCard tokenId={file?.id} />
                </>
              )}

              <HStack p="10px" justifyContent="center">
                {/* file={file} tokensExist={tokensExist} */}
                {file?.owner == user?.id ? (
                  <MintPass
                    file={file}
                    tokensExist={tokensExist}
                    setTokensExist={setTokensExist}
                  />
                ) : (
                  ""
                )}

                {/* {tokensExist && ( */}
                {tokensExist && (
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    onClick={() => {
                      window.open(
                        `https://testnets.opensea.io/assets/mumbai/${PixieAddress}/${file.id}`,
                        "_blank"
                      );
                    }}
                  >
                    Get pass
                  </Button>
                )}
              </HStack>
            </VStack>
          </Box>
        </HStack>
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Direct access sharing with:
          </Text>
          {file?.sharedWith?.length == 0 ? "Not Shared with anybody yet" : ""}

          <UnorderedList>
            {file?.sharedWith?.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      </VStack>
    </Layout>
  );
}

export default ImagePage;
