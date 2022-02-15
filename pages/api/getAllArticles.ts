import { parseForm } from "@middlewares/index";
import { Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import { connectHandler, findOperation, Resolver } from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document, ObjectId } from "mongodb";
import { Article, ArticleDoc } from "@models/index";

const handler = connectHandler();

handler.use(parseForm).get(async (req: Req, res: Res) => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //query string;
  const query = req.query;

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const articles = await (
    await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
  ).toArray();

  res.json(articles);
});

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
