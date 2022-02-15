import {
  Box,
  Flex,
  IconButton,
  LayoutProps,
  FlexboxProps,
  useToast,
} from "@chakra-ui/react";
import Image from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FC, memo, Dispatch, SetStateAction, useContext } from "react";
import { ApiResponse, ImageList, LocalImages } from "@Types/global";
import axios from "axios";
import { getAccessToken } from "./authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { mutate } from "swr";

const SimpleImageGallery: FC<{
  minWidth?: LayoutProps["minW"];
  maxWidth?: LayoutProps["maxWidth"];
  gap?: FlexboxProps["gap"];
  quality?: string | number;
  sources: ImageList | LocalImages;
  isLocal: boolean;
  removeLocalImages?: Dispatch<SetStateAction<LocalImages>>;
}> = ({
  minWidth,
  maxWidth,
  gap,
  quality,
  sources,
  isLocal,
  removeLocalImages,
}) => {
  const notification = useToast();

  // conditional sources
  const localImages = (isLocal ? (sources as LocalImages) : null)!;
  const imageList = (!isLocal ? (sources as ImageList) : null)!;

  //filter images locally(from shared state)
  const removeLocal = (file: File) => {
    removeLocalImages!((prev) =>
      prev.filter((val) => val.file.name !== file.name)
    );
  };

  //removes and mutate imagelist
  const removeDb = async (val: unknown) => {
    notification({
      title: "Removing...",
      status: "info",
      duration: 1000,
    });

    const imageData = val as ImageList["result"][0];
    const { token } = await getAccessToken(csrfToken);

    const { status, statusCode }: ApiResponse = await (
      await axios.post("/api/deleteImage", { accesstoken: token, imageData })
    ).data;

    if (status && statusCode === 202) {
      const filtered: ImageList = {
        result: imageList.result.filter(
          (val) =>
            val.name !== imageData.name && val.public_id !== imageData.public_id
        ),
      };
      mutate("/api/imageList", filtered, false);
      notification({
        title: "Successfully Removed",
        status: "success",
        duration: 1000,
      });
    } else {
      notification({
        title: "Failed to remove image.",
        status: "error",
        duration: 1000,
      });
    }
  };

  //local delete button
  const delFromLocal = (file: File) => {
    return (
      <Box position={"absolute"} bottom={"2"} right={"2"}>
        <IconButton
          onClick={() => removeLocal(file)}
          shadow="xl"
          icon={<RiDeleteBin6Line />}
          aria-label="delete image button"
          rounded={"full"}
          bg="white"
          size="md"
          color="beta.cerise.500"
          _focus={{ outline: "none" }}
        />
      </Box>
    );
  };

  //db delete button
  const delFromDb = (val: unknown) => {
    const flag = val as ImageList["result"][0];
    return (
      <Box position={"absolute"} bottom={"2"} right={"2"}>
        <IconButton
          data-button={flag.public_id}
          onClick={() => removeDb(val)}
          shadow="xl"
          icon={<RiDeleteBin6Line />}
          aria-label="delete image button"
          rounded={"full"}
          bg="white"
          size="md"
          color="beta.cerise.500"
          _focus={{ outline: "none" }}
        />
      </Box>
    );
  };

  const renderImages = () => {
    if (isLocal) {
      return localImages.map((val, i) => (
        <ImageComponent
          key={i}
          data={{ src: val.src, name: val.name, file: val.file }}
        />
      ));
    } else {
      return imageList.result.map((val, i) => (
        <ImageComponent key={i} data={val} />
      ));
    }
  };

  const ImageComponent: FC<{
    data: unknown;
  }> = ({ data }) => {
    return (
      <Box
        rounded="xl"
        overflow={"hidden"}
        transition={"all 500ms ease"}
        minWidth={minWidth ? minWidth : "150px"}
        maxWidth={maxWidth ? maxWidth : "auto"}
        flexGrow={1}
        position={"relative"}
      >
        <Image
          quality={quality ? quality : 75}
          src={(data as any).src}
          placeholder="blur"
          blurDataURL="/placeholder.png"
          width={150}
          height={150}
          alt="no preview"
          layout="responsive"
          objectFit="cover"
        />
        {isLocal
          ? delFromLocal((data as LocalImages[0]).file)
          : delFromDb(data as ImageList["result"])}
      </Box>
    );
  };

  return (
    <>
      <Flex flexWrap={"wrap"} gap={gap ? gap : 5}>
        {renderImages()}
      </Flex>
    </>
  );
};

export default memo(SimpleImageGallery);
