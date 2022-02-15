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

const LinearGrid: FC<ContainerProps & { articles: ArticleDoc[] }> = ({
  articles,
  ...rest
}) => {
  return (
    <Container maxWidth={"container.xl"} {...rest}>
      <Flex columnGap={5}>
        <CardBox article={articles[0]} />
        <CardBox article={articles[1]} />
        <CardBox article={articles[2]} />
        <CardBox article={articles[3]} />
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
      <Box
        overflow={"hidden"}
        bg="white"
        shadow="shade.subtle"
        rounded="xl"
        transition="all 300ms ease"
        _hover={{ transform: "scale(1.020)" }}
        cursor="pointer"
        {...rest}
      >
        <Box maxW="full" minW="10rem" maxH="10rem" overflow={"hidden"}>
          <Image
            alt="no preview"
            src={article.thumbNail.headerPic as any}
            layout="responsive"
            objectFit="cover"
            width={250}
            height={250}
            placeholder="blur"
            blurDataURL={article.thumbNail.headerPic as any}
          />
        </Box>
        <VStack p={5} alignSelf="end" spacing={5}>
          <Heading size={"sm"} color="gray.500" lineHeight="7">
            {article.thumbNail.title}
          </Heading>
          <Text mt={2} fontSize="sm" noOfLines={1} color="gray.500">
            {article.thumbNail.description}
          </Text>
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
      </Box>
    </Link>
  );
};

export default memo(LinearGrid);
