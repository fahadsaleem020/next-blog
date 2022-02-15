import { ArticleDoc } from "@models/index";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import parse, { HTMLReactParserOptions } from "html-react-parser";
import Image from "next/image";
import { Box, Container } from "@chakra-ui/react";
import styles from "../../styles/post.module.css";
import { connectToDatabase, dbName } from "@config/client.config";
import { findOperation, Resolver } from "@utils/index";
import { Collection, Document } from "mongodb";

type ArticleWithID = ArticleDoc & { _id: string };

const Post: NextPage<{ article: ArticleWithID }> = ({ article }) => {
  //
  const options: HTMLReactParserOptions = {
    trim: true,
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.name === "img") {
        return (
          <Box rounded="xl" overflow={"hidden"}>
            <Image
              alt="no preview"
              src={domNode.attribs.src}
              layout="responsive"
              objectFit="cover"
              width={350}
              height={150}
              placeholder="blur"
              blurDataURL={domNode.attribs.src}
            />
          </Box>
        );
      }
    },
  };
  const articleBody = parse(article.body, options);

  return (
    <Container maxW="container.lg" className={styles.container}>
      {articleBody}
    </Container>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const articles = await (
    await await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
  ).toArray();

  const paths = articles.map((val) => ({
    params: { id: [val._id.toString(), val.slug] },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //from parameters
  const articleId = (params as any).id[0];
  const articleSlug = (params as any).id[1];

  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const article = (
    await (
      await await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
    ).toArray()
  )
    .filter((val) => val._id.toString() === decodeURIComponent(articleId))
    .map((val) => ({
      ...val,
      _id: val._id.toString(),
      createdAt: val.createdAt.toISOString(),
      updatedAt: val.updatedAt.toISOString(),
    }))[0];

  return {
    props: { article },
    revalidate: 10,
  };
};

export default Post;
