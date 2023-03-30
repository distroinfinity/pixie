import React, { useState, useContext } from "react";
import Footer from "@/components/footer";
import {
  Flex,
  Box,
  Button,
  Image,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { Polybase } from "@polybase/client";
import { Auth } from "@polybase/auth";
import { User_data } from "@/contexts/userContexts";

const auth = typeof window !== "undefined" ? new Auth() : null;

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

export default function Home() {
  const { user, setUser } = useContext(User_data);
  const [signingIn, setSigningIn] = useState(false);

  async function signIn() {
    setSigningIn(true);
    const authState = await auth.signIn();
    console.log("signed in", authState);
    // get public
    let publicKey = authState.userId;

    if (!publicKey) {
      publicKey = await getPublicKey();
    }

    // Create user if not exists
    let user;
    try {
      user = await db.collection("User").record(publicKey).get();
      console.log("User Already exists");
    } catch (e) {
      // .create() accepts two params, address and name of user
      user = await db.collection("User").create([publicKey, "placeholderName"]);
      console.log("New User created");
    }

    console.log("user is ", user.data);
    setUser(user.data);
    setSigningIn(false);
  }

  async function signOut() {
    const authState = await auth.signOut();
    console.log("singed out", authState);
    setUser(null);
  }

  return (
    <>
      <Flex
        className="font"
        bgGradient="linear(to-l, #ffffff, #FFF56D,#99FFCD, #9FB4FF   )"
        flexDir={"column"}
        color="#293462"
        cursor={"default"}
        h={"100vh"}
      >
        <HStack
          marginTop={"10%"}
          flexDir={"row"}
          align={"center"}
          justifyContent="center"
          w="100%"
        >
          <Box>
            <Image
              boxSize="260px"
              objectFit="cover"
              src="./images/pixie.png"
              alt="Pixie"
            />
          </Box>

          <VStack w="40%">
            <Text fontSize={"75px"} fontWeight={"bold"}>
              Pixie
            </Text>
            <Text
              className="sub"
              fontSize={"20px"}
              fontWeight={"normal"}
              w={"1000px"}
              textAlign={"center"}
              opacity={"85%"}
            >
              built with ❤️ by distro at{" "}
              <a
                href={"https://eif3.devfolio.co/"}
                target={"_blank"}
                rel={"noreferrer"}
                style={{ textDecoration: "underline" }}
              >
                EIF3.0
              </a>{" "}
            </Text>
            {user ? (
              <Text
                className="sub"
                fontSize={"24px"}
                fontWeight={"normal"}
                w={"1000px"}
                textAlign={"center"}
                opacity={"85%"}
              >
                gm, {user?.id}
              </Text>
            ) : (
              ""
            )}

            <Flex gap={"20.35px"}>
              {!user ? (
                <Button
                  isLoading={signingIn}
                  loadingText="Signing in"
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
                  onClick={signIn}
                >
                  Sign In
                </Button>
              ) : (
                <>
                  <Link href={"./home"}>
                    <Button
                      height={"47px"}
                      paddingRight={"25px"}
                      paddingLeft={"25px"}
                      rounded={"4px"}
                      bg={"#C0DEFF"}
                      fontSize={"20px"}
                      fontWeight={"normal"}
                      _hover={{
                        background: "#497E48",
                        boxShadow: "0px 1px 12px rgba(255,255,255,0.05)",
                      }}
                      _active={{}}
                    >
                      My pit
                    </Button>
                  </Link>
                  <Button
                    height={"47px"}
                    paddingRight={"25px"}
                    paddingLeft={"25px"}
                    rounded={"4px"}
                    bg={"rgba(255, 255, 255, 0.04)"}
                    border={"1px solid rgba(255, 255, 255, 0.1)"}
                    fontSize={"20px"}
                    fontWeight={"normal"}
                    _hover={{
                      background: "rgba(255, 255, 255, 0.02)",
                      boxShadow: "0px 1px 12px rgba(255,255,255,0.05)",
                    }}
                    _active={{}}
                    onClick={signOut}
                  >
                    SignOut
                  </Button>
                </>
              )}
            </Flex>
          </VStack>
        </HStack>
        {/* <Footer /> */}
      </Flex>

      {/* <Header /> */}
    </>
  );
}
