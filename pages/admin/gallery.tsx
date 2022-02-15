import {
  Box,
  HStack,
  Button,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { LoaderContainer, LoaderBody } from "@components/loader";
import { AddTags } from "@components/editor";
import { IoAdd } from "react-icons/io5";
import { RiRefreshLine } from "react-icons/ri";
import SharedModal from "@components/modal";
import SimpleGallery from "@components/simpleGallery";
import { useCallback, useContext, useState } from "react";
import { useArticle } from "@components/stores";
import ImagesProvider, { ImagesContext } from "@components/imagesProvider";
import { useSWRConfig } from "swr";
import { useImageList } from "@withSWR/images";
import AddImage from "@components/addImage";
import { getAccessToken } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { ApiResponse } from "@Types/global";
import axios from "axios";
import Admin from "@components/adminLayout";

const Gallery = () => {
  const { data, isLoading, isValidating, isError } = useImageList();

  return (
    <Admin>
      <ImagesProvider>
        <ContextualMenu />
      </ImagesProvider>
      <Box p={5}>
        {isLoading || isValidating || isError ? (
          <LoaderContainer h="80vh">
            <LoaderBody margin="auto" />
          </LoaderContainer>
        ) : (
          <SimpleGallery sources={data!} gap={3} isLocal={false} />
        )}
      </Box>
    </Admin>
  );
};

const ContextualMenu = () => {
  const { mutate } = useSWRConfig();
  // const [, set] = useState(second);
  const [isUploading, setIsuploading] = useState(false);
  const [localImages, _] = useContext(ImagesContext)!;
  const ArticleTags = useArticle(useCallback((state) => state.tags, []));

  //stepper state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNext,
    onOpen: onNextOpen,
    onClose: onNextClose,
  } = useDisclosure();

  //upload images handler
  const uploadImagesHandler = async () => {
    const tags = Array.from(ArticleTags?.values() ?? []);
    const isTags = tags.length;
    const formdata = new FormData();
    for (let i in localImages) {
      formdata.append(
        localImages[i].name.slice(0, localImages[i].name.indexOf(".")),
        localImages[i].file
      );
    }
    const { token } = await getAccessToken(csrfToken);
    formdata.append("tags", JSON.stringify(tags));
    formdata.append("accesstoken", token);
    if (isTags && localImages.length) {
      setIsuploading(true);
      const data: ApiResponse = await (
        await axios.post("/api/uploadImages", formdata)
      ).data;
      if (data.status && data.statusCode === 201) {
        setIsuploading(false);
        mutate("/api/imageList", false);
      }
    } else {
      setIsuploading(false);
      alert("images or tags not provided!");
    }
  };

  return (
    <HStack justifyContent={"end"} px={5} py={3}>
      <Button
        rounded={"full"}
        variant="ghost"
        colorScheme={"twitter"}
        aria-label="add image"
        _focus={{ outline: "none" }}
        leftIcon={<RiRefreshLine size={23} />}
        onClick={() => mutate("/api/imageList")}
      >
        refresh
      </Button>
      <IconButton
        rounded={"full"}
        colorScheme={"blue"}
        aria-label="add image"
        _focus={{ outline: "none" }}
        icon={<IoAdd size={23} />}
        onClick={onOpen}
      />

      <SharedModal
        animate="scale"
        body={<AddImage />}
        modalTitle="Add Images"
        toggleProps={{ isOpen, onClose }}
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
          >
            <Button
              colorScheme={"blue"}
              _focus={{ outline: "none" }}
              onClick={() => {
                onClose();
                onNextOpen();
              }}
            >
              Next
            </Button>
          </Box>
        }
      />
      <SharedModal
        body={<AddTags />}
        animate="scale"
        modalTitle="Add Tags"
        toggleProps={{ isOpen: isNext, onClose: onNextClose }}
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
            display={"flex"}
            justifyContent={"space-between"}
          >
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              h="8"
              variant="ghost"
              onClick={() => {
                onNextClose();
                onOpen();
              }}
            >
              Previous
            </Button>
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              onClick={uploadImagesHandler}
              isLoading={isUploading}
              loadingText="Uploading"
            >
              Upload
            </Button>
          </Box>
        }
      />
    </HStack>
  );
};

export default Gallery;
