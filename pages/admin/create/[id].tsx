import Editor from "@components/editor";
import { NextPage } from "next";
import { Box } from "@chakra-ui/react";
import Admin from "@components/adminLayout";

const CreatePost: NextPage = () => {
  return (
    <Admin>
      <Box h="80vh">
        <Editor editable={true} />
      </Box>
    </Admin>
  );
};

export default CreatePost;
