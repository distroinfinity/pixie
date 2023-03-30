import { Box, Divider, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" textAlign="center">
      {/* <Divider my={6} /> */}
      <Text fontSize="sm" color="gray.500">
        © {new Date().getFullYear()} built with ❤️ <br></br> by Manu :)
      </Text>
    </Box>
  );
};

export default Footer;
