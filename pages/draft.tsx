import { Box } from "@chakra-ui/react";
import AuthenticatedPage from "@components/authenticatedPage";
import { LoaderContainer, LoaderBody } from "@components/loader";

const Draft = () => {
  return (
    <>
      <AuthenticatedPage
        redirectIfOffline="/login"
        loader={
          <LoaderContainer h="99vh">
            <LoaderBody margin="auto" />
          </LoaderContainer>
        }
      >
        <Box p="2">draft page</Box>
      </AuthenticatedPage>
    </>
  );
};

export default Draft;
