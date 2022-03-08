import { ResHandler, Req, Res } from "@Types/api";
import { PageConfig } from "next";
import { connectHandler, Resolver, findOperation } from "@utils/index";
import { dbName, connectToDatabase } from "@config/client.config";
import { Collection, Document, ObjectId } from "mongodb";
import { Comments, Replies } from "@models/index";
import { parseForm } from "./middlewares";

const handler = connectHandler();

handler.use(parseForm).get(async (req: Req, res: Res) => {
  // client instance
  const { client } = await Resolver(connectToDatabase(), {
    message: "service unavailable",
  });

  //query string;
  const postId = req.query.postId as string;
  const parentId = req.query.parentId as string | undefined;
  const isReplies = req.query.isReplies === "true";

  //comments collection;
  const commentsCollection: Collection<Document> = client
    .db(dbName)
    .collection("comments");

  //get all comments or replies (based on isReplies and prentId)
  const comments =
    isReplies && parentId
      ? await (
          await Resolver(
            findOperation<Replies>(commentsCollection, {
              parentId: parentId,
              isRoot: false,
            })
          )
        )
          .sort({ updatedAt: -1 })
          .toArray()
      : await (
          await Resolver(
            findOperation<Comments>(commentsCollection, {
              postId: postId,
              isRoot: true,
            })
          )
        )
          .sort({ updatedAt: -1 })
          .toArray();

  if (comments.length) {
    res.json({
      status: true,
      statusCode: 200,
      message: "FOUND",
      comments: comments,
    } as ResHandler);
  } else {
    res.json({
      status: false,
      statusCode: 404,
      message: "NOT_FOUND",
    } as ResHandler);
  }
});

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
