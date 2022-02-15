import { ResHandler, Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import {
  connectHandler,
  Resolver,
  findOneOperation,
  Crypto,
  validateToken,
} from "@utils/index";
import { dbName, connectToDatabase } from "@config/client.config";
import { Collection, Document, ObjectId } from "mongodb";
import { Article } from "@models/index";

const handler = connectHandler();

handler.get(async (req: Req, res: Res) => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //query string;
  const query = req.query;

  //verifying accesstoken;
  const token = Crypto.decrypt(decodeURIComponent(<string>query.accesstoken));
  await Resolver(validateToken.accessToken(token), {
    message: "forbidden",
    statusCode: ((): statusCodeFor<"FORBIDDEN"> => 403)(),
  });

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //get article by id;
  const article = await Resolver(
    findOneOperation<Article>(ArticleCollection, {
      _id: new ObjectId(decodeURIComponent(<string>query.id)),
    })
  );

  if (article) {
    res.json(<ResHandler<"FOUND">>{
      message: "FOUND",
      status: true,
      statusCode: 302,
      article,
    });
  } else {
    res.json(<ResHandler<"NOT_FOUND">>{
      message: "NOT_FOUND",
      status: false,
      statusCode: 404,
    });
  }
});

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
