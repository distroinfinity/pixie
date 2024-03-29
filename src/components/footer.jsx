import {
  Box,
  Divider,
  HStack,
  Image,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";

const Footer = () => {
  return (
    <VStack as="footer" textAlign="center">
      {/* <Divider my={6} /> */}
      <Text fontSize="sm" color="gray.500">
        © {new Date().getFullYear()} built with ❤️
      </Text>
      <HStack>
        <Text fontSize="sm" color="gray.500">
          by Manu XD
        </Text>
        <Link href="https://github.com/distroinfinity/pixie" isExternal>
          <Image
            boxSize="15px"
            src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
          ></Image>
        </Link>
      </HStack>
    </VStack>
  );
};

export default Footer;
