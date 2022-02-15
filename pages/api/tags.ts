import { ResHandler, Req, Res } from "@Types/api";
import { PageConfig } from "next";
import { connectHandler, Resolver, findOneOperation } from "@utils/index";
import { dbName, connectToDatabase } from "@config/client.config";
import { Collection, Document } from "mongodb";

const handler = connectHandler();

handler.get(async (req: Req, res: Res) => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //tas collection;
  const tagsCollection: Collection<Document> = client
    .db(dbName)
    .collection("tags");

  //get all tags;
  const tagsList = await Resolver(
    findOneOperation<{ tagsList: Array<string> }>(
      tagsCollection,
      {},
      { projection: { _id: 0 } }
    )
  );
  if (tagsList) {
    res.json({
      status: true,
      statusCode: 200,
      message: "FOUND",
      tags: tagsList.tagsList,
    } as ResHandler);
  } else {
    res.json({
      statusCode: 404,
      message: "NOT_FOUND",
      status: false,
    } as ResHandler<"NOT_FOUND">);
  }
});

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
