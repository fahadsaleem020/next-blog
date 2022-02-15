import { Req, Res, ResHandler, statusCodeFor } from "@Types/api/index";
import { PageConfig } from "next";
import {
  connectHandler,
  Resolver,
  userData,
  validateToken,
  Crypto,
  updateOneOperation,
} from "@utils/index";
import { preventGetRequest, parseFormWithFiles } from "@middlewares/index";
import { dbName, connectToDatabase } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";

const cd = cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
});

const handler = connectHandler();
handler
  .use(preventGetRequest)
  .use(parseFormWithFiles)
  .post(async (req: Req, res: Res) => {
    // get form data with fields and files
    const { fields, files } = userData.genericFormDataWithFiles<{
      fields: { tags: Array<string>; accesstoken: string };
    }>(req);

    // validate access token
    await Resolver(
      validateToken.accessToken(Crypto.decrypt(fields.accesstoken)),
      {
        statusCode: 500,
        message: "Invalid access token",
      }
    );

    //tags field;
    const tags: Array<string> = JSON.parse((<any>fields).tags);

    //uploader function iterator;
    const uploadImage = async (fileName: string, file: formidable.File) => {
      const upload = Resolver(
        cloudinary.uploader.upload(file.filepath, {
          folder: "/blogImageGallery",
          tags,
        }),
        { message: "something went wrong while uploading images" }
      );
    };

    //upload all images into cloudinary;
    files.map((val) => uploadImage(val[0], val[1]));

    // client instance
    const client = await (
      await Resolver(connectToDatabase(), {
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
        message: "SERVICE_UNAVAILABLE",
      })
    ).client;

    //tas collection;
    const tagsCollection: Collection<Document> = client
      .db(dbName)
      .collection("imagetags");

    //uploading tags
    const uploadTags = await Resolver(
      updateOneOperation(
        tagsCollection,
        {},
        { $addToSet: { tagsList: { $each: tags } } }
      )
    );

    res.json(<ResHandler<"CREATED">>{
      message: "CREATED",
      status: true,
      statusCode: 201,
    });
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
