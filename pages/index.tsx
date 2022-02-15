import { NextPage, GetStaticProps } from "next";
import React from "react";
import { Box } from "@chakra-ui/react";
import NavigationContainer from "@components/navigationBar/navigationContainer";
import ClassicGridLayout from "@components/classGrid";
import { ArticleDoc } from "@models/index";
import QuadrupleGrid from "@components/quadrupleGrid";
import LinearGrid from "@components/linearGrid";
import { dbName } from "@config/client.config";
import { findOperation, Resolver } from "@utils/index";
import { Collection, Document } from "mongodb";
import { connectToDatabase } from "@config/client.config";

const Index: NextPage<{ popular: ArticleDoc[]; recently: ArticleDoc[] }> = ({
  popular,
  recently,
}) => {
  return (
    <Box h="100vh" bg="beta.gray.50">
      <NavigationContainer />
      <ClassicGridLayout gap={5} py={5} articles={popular} />
      <QuadrupleGrid mt={10} articles={recently} />
      <LinearGrid mt={10} articles={recently} />
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const articles = (
    await (
      await await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
    ).toArray()
  ).map((val) => ({
    ...val,
    _id: val._id.toString(),
    createdAt: val.createdAt.toISOString(),
    updatedAt: val.updatedAt.toISOString(),
  }));

  const popular = articles.slice(0, 5);
  const recently = articles.slice(Math.max(articles.length - 5, 0));

  return {
    props: { popular, recently },
    revalidate: 10,
  };
};

export default Index;
