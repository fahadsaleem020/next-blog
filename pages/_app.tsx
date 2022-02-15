import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@config/theme.config";
import PersistUser from "@components/persistUser";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PersistUser>
      <ChakraProvider theme={theme}>
        {<Component {...pageProps} />}
      </ChakraProvider>
    </PersistUser>
  );
}

export default MyApp;
