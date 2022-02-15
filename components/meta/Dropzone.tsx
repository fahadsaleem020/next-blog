import {
  Text,
  Center,
  VStack,
  useToast,
  useTheme,
  Box,
} from "@chakra-ui/react";
import { BiImageAdd } from "react-icons/bi";
import { FC, memo } from "react";
import { useDropzone } from "react-dropzone";
import { ArticleStoreInterface } from "@models/index";
import Image from "next/image";

const DropZone: FC<{
  articleStore: ArticleStoreInterface;
}> = ({ articleStore }) => {
  const toast = useToast();
  const { colors } = useTheme();

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/webp, image/avif, image/gif",
    maxFiles: 1,
    onDrop: (image) => {
      const allowedImageSize = 2097152; //2mb
      const isImageSizeAllowed = image[0].size <= allowedImageSize;
      if (!isImageSizeAllowed)
        return toast({
          status: "warning",
          title: "Size",
          description: "Image size should be lesser then 2mb.",
          isClosable: true,
        });
      articleStore.setThumbNailPic(image[0]);
    },
  });

  return (
    <>
      <Center
        cursor="pointer"
        mb="5"
        {...getRootProps({ className: "dropzone" })}
        border="2px dashed"
        borderColor={
          articleStore.thumbNail.headerPic ? "beta.blue.200" : "gray.300"
        }
        bg={articleStore.thumbNail?.headerPic ? "beta.blue.50" : "beta.gray.50"}
        rounded="lg"
        h={articleStore.thumbNail.headerPic ? "auto" : "10rem"}
        p="2"
      >
        <input {...getInputProps()} />
        {articleStore.thumbNail.headerPic ? (
          <Box rounded="lg" overflow={"hidden"} h="130">
            <Image
              src={
                typeof articleStore.thumbNail.headerPic === "string"
                ? articleStore.thumbNail.headerPic
                : URL.createObjectURL(articleStore.thumbNail.headerPic)
              }
              placeholder="blur"
              blurDataURL="/placeholder.png"
              width={150}
              height={150}
              alt="no preview"
              objectFit="cover"
            />
          </Box>
        ) : (
          <VStack>
            <BiImageAdd size="35" color={colors.beta.blue[400]} />
            <Text fontSize="sm" color="beta.blue.600">
              Drop or click
            </Text>
          </VStack>
        )}
      </Center>
    </>
  );
};

export default memo(DropZone);


