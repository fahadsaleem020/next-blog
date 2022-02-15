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
} from "@chakra-ui/react";
import styles from "../styles/classicGrid.module.css";
import { ArticleDoc } from "@models/index";
import Image from "next/image";
import Moment from "react-moment";
import Link from "next/link";

const ClassicGridLayout: FC<ContainerProps & { articles: ArticleDoc[] }> = ({
  articles,
  ...rest
}) => {
  return (
    <Container maxWidth={"container.xl"} className={styles.container} {...rest}>
      <Box className={styles.big}>
        <BigImageBox articles={articles[0]} />
      </Box>
      <Box className={styles.one}>
        <CardBox articles={articles[1]} />
      </Box>
      <Box className={styles.two}>
        <SmallImageBox articles={articles[2]} />
      </Box>
      <Box className={styles.three}>
        <CardBox articles={articles[3]} />
      </Box>
      <Box className={styles.four}>
        <CardBox articles={articles[4]} />
      </Box>
    </Container>
  );
};

const BigImageBox: FC<{ articles: ArticleDoc }> = ({ articles }) => {
  return (
    <Link
      passHref
      href={"/post/[[...id]]"}
      as={`/post/${(articles as any)._id}/${articles.slug}`}
    >
      <Box
        rounded="xl"
        position={"relative"}
        overflow={"hidden"}
        h="25rem"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
        cursor="pointer"
      >
        <Image
          alt="no preview"
          src={articles.thumbNail.headerPic as any}
          layout="responsive"
          objectFit="cover"
          width={150}
          height={150}
          placeholder="blur"
          blurDataURL={articles.thumbNail.headerPic as any}
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          color="beta.gray.200"
          p={10}
          bg="linear-gradient( transparent, black)"
        >
          <Heading size={"sm"}>{articles.thumbNail.title}</Heading>
          <Text mt={2} fontSize="sm" noOfLines={1}>
            {articles.thumbNail.description}
          </Text>
          <HStack mt={5} justifyContent="space-between">
            <HStack>
              <Avatar name={"dummyUser"} src={"dummyPhoto"} bg={"blue.50"} />
              <VStack spacing={0} alignItems="flex-start">
                <Heading size="xs">{"dummyUser"}</Heading>
                <Text fontSize="xs">
                  <Moment format="D MMMM YYYY">{articles.updatedAt}</Moment>
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="xs">{articles.readTime} mins read</Text>
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};

const CardBox: FC<{ articles: ArticleDoc }> = ({ articles }) => {
  return (
    <Link
      passHref
      href={"/post/[[...id]]"}
      as={`/post/${(articles as any)._id}/${articles.slug}`}
    >
      <Box
        shadow="shade.subtle"
        bg="white"
        rounded="xl"
        maxW="20rem"
        p={5}
        overflow={"hidden"}
        minH="11.8rem"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
        cursor="pointer"
        display="flex"
        flexDirection={"column"}
        justifyContent={"end"}
      >
        <Heading size={"sm"} color="gray.500" lineHeight="7">
          {articles.thumbNail.title}
        </Heading>
        <HStack mt={5} justifyContent="space-between">
          <HStack>
            <Avatar name={"dummyUser"} src={"dummyPhoto"} bg={"red.100"} />
            <VStack spacing={1} alignItems="flex-start">
              <Heading size="xs" color="beta.gray.400">
                {"dummyUser"}
              </Heading>
              <Text fontSize="xs" color="gray.500">
                <Moment format="D MMMM YYYY">{articles.updatedAt}</Moment>
              </Text>
            </VStack>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {articles.readTime} mins read
          </Text>
        </HStack>
      </Box>
    </Link>
  );
};

const SmallImageBox: FC<{ articles: ArticleDoc }> = ({ articles }) => {
  return (
    <Link
      passHref
      href={"/post/[[...id]]"}
      as={`/post/${(articles as any)._id}/${articles.slug}`}
    >
      <Box
        rounded="xl"
        position={"relative"}
        overflow={"hidden"}
        maxH="11.8rem"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
        cursor="pointer"
      >
        <Image
          alt="no preview"
          src={articles.thumbNail.headerPic as any}
          layout="responsive"
          objectFit="cover"
          width={150}
          height={150}
          placeholder="blur"
          blurDataURL={articles.thumbNail.headerPic as any}
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
          <Heading size={"sm"}>{articles.thumbNail.title}</Heading>
          <HStack mt={5} justifyContent="space-between">
            <HStack>
              <Avatar name={"dummyUser"} src={"dummyPhoto"} bg={"blue.50"} />
              <VStack spacing={0} alignItems="flex-start">
                <Heading size="xs">{"dummyUser"}</Heading>
                <Text fontSize="xs">
                  <Moment format="D MMMM YYYY">{articles.updatedAt}</Moment>
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="xs">{articles.readTime} mins read</Text>
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};

export default memo(ClassicGridLayout);
