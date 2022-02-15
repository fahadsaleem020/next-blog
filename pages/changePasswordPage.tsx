import { Box } from "@chakra-ui/react";
import ChangePasswordForm from "@components/passwordForm/changePassword";
import type { NextPage } from "next";
import UnAuthenticatedPage from "@components/unAuthenticatedPage";
import { LoaderBody, LoaderContainer } from "@components/loader";

const ChangePasswordPage: NextPage = () => {
  return (
    <UnAuthenticatedPage
      loader={
        <LoaderContainer>
          <LoaderBody m="auto" />
        </LoaderContainer>
      }
      redirectIfOnline={"/"}
    >
      <Box flexBasis="sm" mx="auto" my="20">
        <ChangePasswordForm />
      </Box>
    </UnAuthenticatedPage>
  );
};

export default ChangePasswordPage;
