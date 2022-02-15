import { Box, Center, Text, VStack, useTheme } from "@chakra-ui/react";
import { BiImageAdd } from "react-icons/bi";
import SimpleGallery from "@components/simpleGallery";
import { useDropzone } from "react-dropzone";
import { memo, useContext } from "react";
import { ImagesContext } from "./imagesProvider";
const AddImage = () => {
  const [localImages, setLocalImages] = useContext(ImagesContext)!;

  // dropZone hook
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/webp, image/avif, image/gif",
    maxFiles: 5,
    onDrop: (image) => {
      if (image.length > 5) return alert("max 5 files can be selected");
      const allowedImageSize = 2097152; //2mb
      const isImageSizeAllowed = image.every(
        (file) => file.size <= allowedImageSize
      );
      if (!isImageSizeAllowed) return alert("image's larger then 2mb");

      setLocalImages([
        ...localImages,
        ...image.map((file) => ({
          name: file.name,
          file: file,
          src: URL.createObjectURL(file),
        })),
      ]);

      // setLocalImages((prev) => [
      //   ...prev,
      //   ...image.map((file) => ({
      //     name: file.name,
      //     file: file,
      //     src: URL.createObjectURL(file),
      //   })),
      // ]);
    },
  });
  const { colors } = useTheme();

  const [_localImages, setlocalImages] = useContext(ImagesContext)!;

  return (
    <Box>
      <Center
        cursor="pointer"
        {...getRootProps()}
        border="2px dashed"
        borderColor={"beta.blue.200"}
        bg={"beta.blue.50"}
        rounded="lg"
        h={"10rem"}
        p="2"
      >
        <input {...getInputProps()} />
        <VStack>
          <BiImageAdd size="35" color={colors.beta.blue[400]} />
          <Text fontSize="sm" color="beta.blue.600">
            Drop multiple or Click
          </Text>
        </VStack>
      </Center>
      {localImages.length ? (
        <Box mt={10}>
          <SimpleGallery
            gap={3}
            sources={localImages}
            maxWidth={"150px"}
            isLocal={true}
            removeLocalImages={setlocalImages}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default memo(AddImage);
