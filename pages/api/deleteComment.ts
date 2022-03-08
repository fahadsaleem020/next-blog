import { parseForm, csrfToken, preventGetRequest } from "@middlewares/index";
import { ResHandler, Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import {
  connectHandler,
  getParsedCookies,
  Crypto,
  validateToken,
  revokeLocalSession,
  Resolver,
  updateOneOperation,
  validateOrGenerateSessionId,
  userData,
  findOperation,
  findOneOperation,
  deleteOneOperation,
  deleteOperation,
} from "@utils/index";
import { connectToDatabase } from "@config/client.config";
import { Collection, Document, ObjectId } from "mongodb";
import {
  ArticleDoc,
  Comments,
  Payload,
  Replies,
  sessionModel,
} from "@models/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //form data;
    const { comment, accessToken } = userData.genericFormData<{
      comment: Comments & {
        _id: string;
        parentId: string;
      };
      accessToken: string;
    }>(req);

    // validate access token
    const fromToken = await Resolver<Payload>(
      validateToken.accessToken(Crypto.decrypt(accessToken)),
      {
        statusCode: 500,
        message: "Invalid token",
      }
    );

    // client instance;
    const dbClient = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).db;

    //comments collection;
    const commentsCollection = dbClient.collection("comments");

    if (!comment.isRoot && comment.replyCount) {
      //delete reply and nested replies then update replyCount of parent;
      const isDeleted = await Resolver(
        deleteOperation<Replies>(commentsCollection, {
          identity: comment.identity,
          _id: { $ne: new ObjectId(comment.parentId) },
          postId: comment.postId,
          userId: fromToken.userId!,
        })
      );

      if (isDeleted.acknowledged && isDeleted.deletedCount) {
        const updateCommentCount = await Resolver(
          updateOneOperation<Comments>(
            commentsCollection,
            {
              _id: new ObjectId(comment.parentId),
            },
            {
              $inc: { replyCount: -1 },
            }
          )
        );
        if (!updateCommentCount.modifiedCount)
          return res.json({
            status: false,
            message: "failed to update replyCount of parent",
            statusCode: 404,
          } as ResHandler);

        return res.json({
          status: true,
          message: "OK",
          statusCode: 200,
        } as ResHandler);
      }
      return res.json({
        status: false,
        message: "NOT_FOUND",
        statusCode: 404,
      } as ResHandler);
    } else if (comment.isRoot && comment.replyCount) {
      //delete root comment and all the nested replies;
      const isDeleted = await Resolver(
        deleteOperation<Replies>(commentsCollection, {
          identity: comment.identity,
          postId: comment.postId,
          userId: fromToken.userId!,
        })
      );

      if (isDeleted.acknowledged && isDeleted.deletedCount) {
        return res.json({
          status: true,
          message: "OK",
          statusCode: 200,
        } as ResHandler);
      }

      return res.json({
        status: false,
        message: "failed to delete root and all the nested comments.",
        statusCode: 417,
      } as ResHandler);
    } else if (!comment.isRoot) {
      //delete single nested reply and update the replyCount of parent;
      console.log("testing over here");
      const isDeleted = await Resolver(
        deleteOneOperation(commentsCollection, {
          _id: new ObjectId(comment._id),
          postId: comment.postId,
          userId: fromToken.userId!,
        })
      );

      if (isDeleted.acknowledged && isDeleted.deletedCount) {
        const updateCommentCount = await Resolver(
          updateOneOperation<Comments>(
            commentsCollection,
            {
              _id: new ObjectId(comment.parentId),
            },
            {
              $inc: { replyCount: -1 },
            }
          )
        );
        if (!updateCommentCount.modifiedCount)
          return res.json({
            status: false,
            message: "failed to update replyCount of parent",
            statusCode: 417,
          } as ResHandler);

        return res.json({
          status: true,
          message: "OK",
          statusCode: 200,
        } as ResHandler);
      }

      return res.json({
        status: false,
        message: "NOT_FOUND",
        statusCode: 404,
      } as ResHandler);
    }

    // delete single comment;
    console.log("delete single comment, (lastly)");
    const isDeleted = await Resolver(
      deleteOneOperation(commentsCollection, {
        _id: new ObjectId(comment._id),
        postId: comment.postId,
        userId: fromToken.userId!,
      })
    );

    if (isDeleted.acknowledged && isDeleted.deletedCount) {
      return res.json({
        status: true,
        message: "OK",
        statusCode: 200,
      } as ResHandler);
    }

    res.end("end call");
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
