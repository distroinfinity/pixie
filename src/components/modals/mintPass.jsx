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

import { PixieAddress } from "../../../hardhat/config";
import Pixie from "./../../../hardhat/artifacts/contracts/Pixie.sol/Pixie.json";

import { useRouter } from "next/router";

function MintPass({ file }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [numPasses, setNumPasses] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  const router = useRouter();

  useEffect(() => {}, []);

  const handleNumPassesChange = (event) => {
    setNumPasses(parseInt(event.target.value));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
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

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Num Passes:", numPasses);
    console.log("Selected Image:", selectedImage);
  };

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
        <AddIcon /> Mint Pass
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
