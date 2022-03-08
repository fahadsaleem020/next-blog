import { parseForm, preventGetRequest } from "@middlewares/index";
import { ResHandler, Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import {
  connectHandler,
  Crypto,
  validateToken,
  Resolver,
  userData,
  insertOneOperation,
  updateOneOperation,
} from "@utils/index";
import { connectToDatabase } from "@config/client.config";
import { Comments, Payload } from "@models/index";
import { ObjectId } from "mongodb";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //form data;
    const { comment, accessToken } = userData.genericFormData<{
      comment: Comments & { parentId: string };
      accessToken: string;
    }>(req);

    // validate access token
    const { userId } = await Resolver<Payload>(
      validateToken.accessToken(Crypto.decrypt(accessToken)),
      {
        statusCode: 500,
        message: "Invalid token",
      }
    );

    //adding userId field into comment object;
    comment.userId = userId;

    // client instance;
    const dbClient = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).db;

    //comments collection;
    const commentsCollection = dbClient.collection("comments");

    // upload comment
    const insertComment = await insertOneOperation<Comments>(
      commentsCollection,
      comment
    );

    //increment repliesCount field of parent comment;
    if (!comment.isRoot && comment.parentId) {
      const updateRepliesCountField = await Resolver(
        updateOneOperation<Comments>(
          commentsCollection,
          { _id: new ObjectId(comment.parentId) },
          { $inc: { replyCount: 1 } }
        )
      );
      if (!updateRepliesCountField.modifiedCount)
        return res.json({
          message: "FORBIDDEN",
          statusCode: 403,
          status: false,
        } as ResHandler<"FORBIDDEN">);
      return res.json({
        message: "OK",
        statusCode: 200,
        status: true,
        insertedId: insertComment.insertedId.toString(),
      } as ResHandler);
    }

    //if root comment not inserted;
    if (insertComment.acknowledged && insertComment.insertedId) {
      return res.json({
        message: "OK",
        statusCode: 200,
        status: true,
      } as ResHandler);
    }

    res.json({
      message: "FORBIDDEN",
      statusCode: 403,
      status: false,
    } as ResHandler<"FORBIDDEN">);
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
