import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Box,
  FormControl,
  FormLabel,
  Center,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Web3Storage } from "web3.storage";
import lighthouse from "@lighthouse-web3/sdk";
import { PixieAddress } from "../../../hardhat/config";
import Pixie from "./../../../hardhat/artifacts/contracts/Pixie.sol/Pixie.json";

function MintPass({ file, tokensExist }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [numPasses, setNumPasses] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [minting, setMinting] = useState(false);

  const fileInputRef = useRef(null);

  const handleNumPassesChange = (event) => {
    setNumPasses(parseInt(event.target.value));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      // setImageEvent(event);
      setImageFile(event.target.files);
      // setSelectedImage(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
    setIsDraggingOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log("Num Passes:", numPasses);
    // console.log("Selected Image file:", imageFile);
    setMinting(true);
    const tokenUri = storeFiles();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://rpc-mumbai.maticvigil.com"
    // );

    const signer = provider.getSigner();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);
    let mintNFT = await pixie.mint(file.id, numPasses, true, tokenUri);
    console.log("NFT Minted", mintNFT);
    // add access condition if already not applied
    console.log("does token exist", tokensExist);
    if (!tokensExist) {
      applyAccessCondition(file); //to do fix this condition
    }
    setMinting(false);
    onClose(true);
  };
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
  async function applyAccessCondition(file) {
    const cid = file.cid;
    const tokenId = parseInt(file.id);
    console.log(tokenId, typeof tokenId);

    // Conditions to add

    const conditions = [
      {
        id: 1,
        chain: "Mumbai",
        method: "balanceOf",
        standardContractType: "ERC1155",
        contractAddress: "0x7A817D959DB2307fdb82dbB3B3f4bf8925D5d6C7",
        returnValueTest: { comparator: ">=", value: "1" },
        parameters: [":userAddress", tokenId],
      },
    ];

    // Aggregator is what kind of operation to apply to access conditions
    // Suppose there are two conditions then you can apply ([1] and [2]), ([1] or [2]), !([1] and [2]).
    const aggregator = "([1])";
    const { publicKey, signedMessage } = await encryptionSignature();

    const response = await lighthouse.accessCondition(
      publicKey,
      cid,
      signedMessage,
      conditions,
      aggregator
    );

    console.log("condition applied", response);

    /*
      {
        data: {
          cid: "QmZkEMF5y5Pq3n291fG45oyrmX8bwRh319MYvj7V4W4tNh",
          status: "Success"
        }
      }
    */
  }

  function getAccessToken() {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlhMTRCMDdEOTM5NDQwYWM1N0Y0NEVGOTAyQzBENjc5OEQ1NTNmRUUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Nzg2ODcwNDU2OTgsIm5hbWUiOiJwaXhpZSJ9.zzdmifJ-Mk4wo3bMsu2VQwe79mKIKWAXepb8nivhOCU";

    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    // return process.env.WEB3STORAGE_TOKEN;
  }
  function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() });
  }
  async function storeFiles() {
    // return "https://bafybeiclfw2tifmad5s3ik6akq3vhpxwpwwbuwaxjvqifnyf5iwz7w4hry.ipfs.dweb.link/0.json";
    const client = makeStorageClient();
    const coverCid = await client.put(imageFile);
    const imageUrl = `https://${coverCid}.ipfs.dweb.link/${imageFile[0].name}`;
    console.log("nft cover url", imageUrl);
    const jsonFile = makeJsonFile(imageUrl);
    const jsonCid = await client.put(jsonFile);
    const jsonUrl = `https://${jsonCid}.ipfs.dweb.link/${file.id}.json`;
    console.log("nft url", jsonUrl);
    return jsonUrl;
  }
  function makeJsonFile(imageUrl) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    let filename = file.name;
    const obj = {
      name: filename + " Pass",
      description: `Access token for ${filename}`,
      image: imageUrl,
    };
    const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });

    const files = [new File([blob], `${file.id}.json`)];
    return files;
  }

  return (
    <>
      <Button
        onClick={onOpen}
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
        <AddIcon marginRight="4px" /> Mint Pass
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mint Passes for: {file?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              <Box maxW="md" borderWidth="1px" borderRadius="lg" p="6">
                <FormControl onSubmit={handleSubmit}>
                  <FormLabel htmlFor="num-passes">No of Passes</FormLabel>
                  <Input
                    id="num-passes"
                    type="number"
                    value={numPasses}
                    onChange={handleNumPassesChange}
                  />
                </FormControl>

                <FormControl mt="4">
                  <FormLabel htmlFor="image-select">Select Image</FormLabel>
                  <Input
                    id="image-select"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                  />
                  <Box
                    mt="4"
                    borderWidth="1px"
                    borderColor={isDraggingOver ? "blue.400" : "gray.200"}
                    borderStyle="dashed"
                    p="4"
                    textAlign="center"
                    fontWeight="bold"
                    color={isDraggingOver ? "blue.400" : "gray.400"}
                    cursor="pointer"
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedImage
                      ? "Change Image"
                      : "Click or drag and drop an image here"}
                  </Box>
                </FormControl>

                {selectedImage && (
                  <Box mt="4">
                    <img src={selectedImage} alt="Selected" />
                  </Box>
                )}

                <Button
                  isLoading={minting}
                  loadingText="minting..."
                  mt="4"
                  colorScheme="blue"
                  isDisabled={!selectedImage}
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </Box>
            </Center>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MintPass;
