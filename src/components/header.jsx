import { useContext } from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Heading,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { User_data } from "@/contexts/userContexts";

import AddFile from "./modals/addFile";
import React from "react";

function Header({ setFiles }) {
  const { user, setUser } = useContext(User_data);
  const router = useRouter();

  return (
    <>
      <Box
        bgGradient="linear(to-l, #FFF56D,#99FFCD, #9FB4FF   )"
        px={4}
        rounded={"10px"}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}>
            <Flex
              alignItems="center"
              onClick={() => {
                router.push("/", "/");
              }}
            >
              <Image
                marginLeft="15px"
                boxSize="60px"
                objectFit="cover"
                src="/pixie.png"
                alt="Pixie Cover"
              />

              <Heading
                marginLeft="15px"
                as="h1"
                size="lg"
                letterSpacing={"-.1rem"}
              >
                Pixie
              </Heading>
            </Flex>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            ></HStack>
          </HStack>
          {user ? (
            <Flex alignItems={"center"}>
              <AddFile setFiles={setFiles} />

              {/* <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={
                      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                    }
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem>Link 1</MenuItem>
                  <MenuItem>Link 2</MenuItem>
                  <MenuDivider />
                  <MenuItem>Link 3</MenuItem>
                </MenuList>
              </Menu> */}
            </Flex>
          ) : (
            <Button
              onClick={() => {
                router.push(`/`);
              }}
              height={"47px"}
              paddingRight={"25px"}
              paddingLeft={"25px"}
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
              Sign In
            </Button>
          )}
        </Flex>
      </Box>
    </>
  );
}

export default Header;
