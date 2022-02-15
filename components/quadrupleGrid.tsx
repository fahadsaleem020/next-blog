import React, { FC, memo } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  ContainerProps,
  Avatar,
  HStack,
  VStack,
  Flex,
  StyleProps,
} from "@chakra-ui/react";
import { ArticleDoc } from "@models/index";
import Image from "next/image";
import Moment from "react-moment";
import Link from "next/link";

const Quadruple: FC<ContainerProps & { articles: ArticleDoc[] }> = ({
  articles,
  ...rest
}) => {
  return (
    <Container maxWidth={"container.xl"} {...rest}>
      <Flex columnGap={5}>
        <CardBox article={articles[0]} />
        <ImageBox article={articles[1]} />
      </Flex>
      <Flex mt={5} columnGap={5}>
        <CardBox article={articles[2]} />
        <CardBox article={articles[3]} minW="41.5rem" />
      </Flex>
    </Container>
  );
};

const CardBox: FC<{ article: ArticleDoc } & StyleProps> = ({
  article,
  ...rest
}) => {
  return (
    <Link
      passHref
      href={"/post/[[...id]]"}
      as={`/post/${(article as any)._id}/${article.slug}`}
    >
      <HStack
        overflow={"hidden"}
        bg="white"
        shadow="shade.subtle"
        rounded="xl"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
      cursor="pointer"
        maxH="11.8rem"
        {...rest}
      >
        <Box minW="10rem" w="15rem">
          <Image
            alt="no preview"
            src={article.thumbNail.headerPic as any}
            layout="responsive"
            objectFit="cover"
            width={250}
            height={350}
            placeholder="blur"
            blurDataURL={article.thumbNail.headerPic as any}
          />
        </Box>
        <VStack py={5} pr={10} pl={2} alignSelf="end" spacing={5}>
          <Heading size={"sm"} color="gray.500" lineHeight="7">
            {article.thumbNail.title}
          </Heading>
          <HStack w="full" justifyContent="space-between">
            <HStack>
              <Avatar name={"dummyUser"} src={"dummyPhoto"} bg={"red.100"} />
              <VStack spacing={1} alignItems="flex-start">
                <Heading size="xs" color="beta.gray.400">
                  {"dummyUser"}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  <Moment format="D MMMM YYYY">{article.updatedAt}</Moment>
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {article.readTime} mins read
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Link>
  );
};
const ImageBox: FC<{ article: ArticleDoc }> = ({ article }) => {
  return (
    <Link
      passHref
      href={"/post/[[...id]]"}
      as={`/post/${(article as any)._id}/${article.slug}`}
    >
      <Box
        rounded="xl"
        position={"relative"}
        overflow={"hidden"}
        maxH="11.8rem"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
        cursor="pointer"
        minW="41.5rem"
      >
        <Image
          alt="no preview"
          src={article.thumbNail.headerPic as any}
          layout="responsive"
          objectFit="cover"
          width={150}
          height={150}
          placeholder="blur"
          blurDataURL={article.thumbNail.headerPic as any}
          objectPosition="0 -100px"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          color="beta.gray.200"
          p={5}
          bg="linear-gradient( transparent, black)"
        >
          <Heading size={"sm"}>{article.thumbNail.title}</Heading>
          <HStack mt={5} justifyContent="space-between">
            <HStack>
              <Avatar name={"dummyUser"} src={"dummyPhoto"} bg={"blue.50"} />
              <VStack spacing={0} alignItems="flex-start">
                <Heading size="xs">{"dummyUser"}</Heading>
                <Text fontSize="xs">
                  <Moment format="D MMMM YYYY">{article.updatedAt}</Moment>
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="xs">{article.readTime} mins read</Text>
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};

export default memo(Quadruple);
