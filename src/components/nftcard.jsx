import { useState, useEffect } from "react";
import {
  Text,
  Box,
  Image,
  Flex,
  Link,
  HStack,
  VStack,
  Skeleton,
} from "@chakra-ui/react";
import { ethers } from "ethers";

import { PixieAddress } from "../../hardhat/config";
import Pixie from "./../../hardhat/artifacts/contracts/Pixie.sol/Pixie.json";

function NFTCard({ tokenId }) {
  const [tokenUri, setTokenUri] = useState("");

  useEffect(() => {
    async function fetchToken() {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com"
      );
      const contract = new ethers.Contract(PixieAddress, Pixie.abi, provider);
      const uri = await contract.uri(tokenId);

      const response = await fetch(uri);
      const json = await response.json();
      const imageUrl = json.image;
      console.log("image url", imageUrl);
      setTokenUri(imageUrl);
    }
    fetchToken();
  }, [tokenId]);

  return (
    <VStack borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Skeleton isLoaded={tokenUri}>
        <Image
          src={tokenUri}
          alt="Token Image"
          boxSize="60%"
          marginLeft="20%"
        />
      </Skeleton>
      <Box p="6">
        <Flex justifyContent="space-between">
          <Text fontWeight="bold">Contract:</Text>
          <Link
            href={`https://etherscan.io/address/${PixieAddress}`}
            isExternal
          >
            {PixieAddress.substring(0, 7)}....
            {PixieAddress.substring(
              PixieAddress.length - 7,
              PixieAddress.length
            )}
          </Link>
        </Flex>
        <Flex justifyContent="space-between">
          <Text fontWeight="bold">Token ID:</Text>
          <Text>{tokenId}</Text>
        </Flex>
      </Box>
    </VStack>
  );
}

export default NFTCard;
