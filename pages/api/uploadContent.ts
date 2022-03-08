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
import { Collection, Document, ObjectId } from "mongodb";
import { Article, ArticleDoc } from "@models/index";
import { v2 as cloudinary } from "cloudinary";

// put is in enviroment
const cd = cloudinary.config({
  cloud_name: process.env.cloud_name!,
  api_key: process.env.api_key!,
  api_secret: process.env.api_secret!,
  secure: true,
});

const handler = connectHandler();
handler
  .use(preventGetRequest)
  .use(parseFormWithFiles)
  .post(async (req: Req, res: Res) => {
    //
    //form's fields type
    type FieldsType = Omit<Article["thumbNail"], "headerPic"> &
      Omit<Article, "thumbNail"> & {
        accesstoken: string;
        updatable: string;
        headerPic: string | undefined;
        _id: string;
      };

    // get form data with fields and files
    const { fields, files } =
      userData.genericFormDataWithFiles<{ fields: FieldsType }>(req);

    //extracting data from fields object;
    const fileName = files.length ? files["0"]["0"] : null;
    const imageFile = files.length ? files["0"]["1"] : null;
    const tags: string[] = JSON.parse(<any>(<any>fields.tags)[0]);
    const {
      _id,
      slug,
      status,
      title,
      description,
      body,
      updatedAt,

      createdAt,
      updatable,
      readTime,
    } = fields;

    // validate access token
    await Resolver(
      validateToken.accessToken(Crypto.decrypt(fields.accesstoken)),
      {
        statusCode: 500,
        message: "Invalid access token",
      }
    );

    //uploading headerPic into cloudinary;
    const headerPic = (
      files.length
        ? await (
            await Resolver(
              cloudinary.uploader.upload(imageFile!.filepath, {
                folder: "/blogMeta",
                tags,
              }),
              {
                message: "clodinary error",
              }
            )
          ).secure_url
        : fields.headerPic
    ) as any;

    //article doc for update
    const articleUpdate = {
      thumbNail: {
        title,
        description,
        headerPic,
      },
      body,
      updatedAt: new Date(updatedAt),
      readTime: Number(readTime),
      slug,
      status,
      tags,
    };

    //article doc for update
    const articleInsert: ArticleDoc = {
      thumbNail: {
        title,
        description,
        headerPic,
      },
      body,
      createdAt: new Date(),
      updatedAt: new Date(),
      readTime: Number(readTime),
      slug,
      status,
      tags: <any>tags,
      likes: 1,
      views: 1,
    };

    // client instance
    const client = await (
      await Resolver(connectToDatabase(), {
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
        message: "SERVICE_UNAVAILABLE",
      })
    ).client;

    //article collection
    const articleCollection: Collection<Document> = client
      .db(dbName)
      .collection("articles");

    //tas collection;
    const tagsCollection: Collection<Document> = client
      .db(dbName)
      .collection("tags");

    //push tags into database
    const insertTags = await Resolver(
      updateOneOperation(
        tagsCollection,
        {},
        {
          $addToSet: { tagsList: { $each: tags } },
        },
        { upsert: true }
      )
    );

    //insert or update article into database
    if (updatable) {
      console.log("updating");
      const { tags: tagsFromUpdate, ...restFromUpdate } = articleUpdate;
      const updateArticle = await Resolver(
        updateOneOperation(
          articleCollection,
          { _id: new ObjectId(_id) },
          {
            $set: {
              ...restFromUpdate,
              tags: tagsFromUpdate,
              body: body,
            },
          }
        )
      );
      return res.json(<ResHandler>{
        message: "OK",
        status: true,
        statusCode: 200,
        articleInsertionResponse: updateArticle,
        tagsInsertionResponse: insertTags,
      });
    } else if (!updatable) {
      const insertArticle = await Resolver(
        updateOneOperation(
          articleCollection,
          { _id: new ObjectId(undefined) }, //match empty
          {
            $set: {
              ...articleInsert,
            },
          },
          { upsert: true }
        )
      );

      return res.json(<ResHandler>{
        message: "OK",
        status: true,
        statusCode: 200,
        articleInsertionResponse: insertArticle,
        tagsInsertionResponse: insertTags,
      });
    } else {
      res.json(<ResHandler>{
        message: "INTERNAL_SERVER_ERROR",
        status: false,
        statusCode: 500,
      });
    }
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
