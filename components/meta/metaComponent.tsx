import { ChangeEvent, useCallback, useState } from "react";
import { useArticle, useUser } from "@components/stores";
import shallow from "zustand/shallow";
import TitleAndDesc from "@components/meta/titleAndDesc";
import Dropzone from "@components/meta/Dropzone";
import {
  Box,
  HStack,
  Heading,
  Text,
  Avatar,
  VStack,
  useTheme,
} from "@chakra-ui/react";
import NImage from "next/image";
import Moment from "react-moment";
import { BsDot } from "react-icons/bs";

const MetaCompoenent = () => {
  const [isDesc, setIsDesc] = useState<boolean>(false);
  const [isTitle, setIsTitle] = useState<boolean>(false);
  const { colors } = useTheme();
  const articleStore = useArticle((state) => ({ ...state }), shallow);
  const user = useUser((state) => state.user);
  const dateToFormat = articleStore.updatedAt || new Date();

  // handling title and description fields ( not done )
  const setTitleAndDesc = useCallback(
    (
      e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      type: "title" | "description"
    ) => {
      const descLength = 200;
      const TitleLength = 60 + 23;
      const value = e.target.value.trim();

      if (type === "description") {
        value.length > descLength
          ? setIsTitle(true)
          : articleStore.setThumbNailDescription(value);
      } else if (type === "title") {
        value.length > TitleLength
          ? setIsTitle(true)
          : articleStore.setThumbNailTitle(value);
      }
    },
    []
  );

  return (
    <>
      <HStack spacing="10">
        {/* title/descroptoin and dropzone component*/}
        <Box w="3xl">
          <TitleAndDesc
            isLength={{ isDesc, isTitle }}
            articleStore={articleStore}
            setTitleAndDesc={setTitleAndDesc}
          />
          <Dropzone articleStore={articleStore} />
        </Box>
        {/* thumbnail */}
        <Box alignSelf={"start"} flexBasis={"xl"} maxW={"300px"}>
          <Heading size="sm" color="gray.600" mb="3" fontWeight={""}>
            ThumbNail
          </Heading>
          <Box rounded="3xl" bg="gray.100" overflow="hidden" mb="3">
            <NImage
              src={
                (typeof articleStore.thumbNail.headerPic === "string"
                  ? articleStore.thumbNail.headerPic
                  : articleStore.thumbNail.headerPic &&
                    URL.createObjectURL(articleStore.thumbNail.headerPic!)) ||
                "/placeholder.png"
              }
              width={400}
              height={300}
              layout="responsive"
              objectFit="cover"
            />
          </Box>
          <Box pl="2">
            <Heading
              size="sm"
              color="gray.600"
              fontFamily={"Quicksand"}
              noOfLines={2}
              my="2"
              lineHeight={"1.5"}
            >
              {articleStore.thumbNail.title || "Title will appear here"}
            </Heading>
            <Text noOfLines={1} fontSize="normal" color="gray.600">
              {articleStore.thumbNail.description ||
                "Description will appear here"}
            </Text>
            {/* user info */}
            <HStack py="3 " mt="3" color="gray.600">
              <Box
                rounded={"full"}
                p="1"
                border={"1px"}
                borderColor={"gray.300"}
              >
                <Avatar
                  size={"sm"}
                  name={user?.username}
                  src={user?.photo!}
                  rounded={"full"}
                />
              </Box>
              <VStack alignItems={"start"} spacing="1">
                <Heading as="h2" size={"xs"} fontWeight={"normal"}>
                  {user?.username}
                </Heading>
                <Text fontSize={"xs"} display="flex" alignItems={"center"}>
                  <Moment format="D MMM YYYY">{dateToFormat}</Moment>
                  <BsDot color={colors.gray[400]} size={20} />{" "}
                  {articleStore.readTime} min read
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </HStack>
    </>
  );
};

export default MetaCompoenent;
