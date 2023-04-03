import "@/styles/globals.css";
import Head from "next/head";
import Footer from "@/components/footer";
import { ChakraProvider } from "@chakra-ui/react";
import UserContext from "@/contexts/userContexts";

import { MoralisProvider } from "react-moralis";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Pixie</title>
        {/* <meta name="description" content="Generated by create next app" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ChakraProvider>
          <UserContext>
            <Component {...pageProps} />
          </UserContext>
        </ChakraProvider>
      </MoralisProvider>
    </>
  );
}
