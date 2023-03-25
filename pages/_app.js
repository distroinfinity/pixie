import "../styles/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import UserContext from "../public/contexts/userContexts";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <UserContext>
        <MoralisProvider initializeOnMount={false}>
          <NotificationProvider>
            <Component {...pageProps} />
          </NotificationProvider>
        </MoralisProvider>
      </UserContext>
    </>
  );
}

export default MyApp;
