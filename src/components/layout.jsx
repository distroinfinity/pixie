import { Box } from "@chakra-ui/react";
import Header from "./header";
import Footer from "./footer";

function Layout({ children, setFiles }) {
  return (
    <Box>
      {/* Header */}
      <Box p={4}>
        <Box maxW="auto" mx="auto">
          {/* Header content goes here */}
          <Header setFiles={setFiles}></Header>
        </Box>
      </Box>

      {/* Page content */}
      <Box maxW="6xl" mx="auto" px={4} py={8}>
        {children}
      </Box>

      {/* Footer */}
      <Box bg="gray.100" p={4} mt="auto">
        <Box maxW="6xl" mx="auto">
          {/* Footer content goes here */}
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
