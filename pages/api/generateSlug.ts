import { Req, Res, ResHandler, statusCodeFor } from "@Types/api";
import { preventGetRequest, parseForm } from "./middlewares";
import {
  connectHandler,
  userData,
  validateToken,
  Crypto,
  Resolver,
  findOneOperation,
} from "./utils";
import { PageConfig } from "next";
import { dbName, connectToDatabase } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { Article } from "@models/index";
import slugify from "slugify";

const handler = connectHandler();
handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //

    //article collection
    const articleCollection: Collection<Document> = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).client
      .db(dbName)
      .collection("articles");

    //get "title" from user post payload
    const { title, token } =
      userData.genericFormData<{ title: string; token: string }>(req);

    //token validation
    const accessToken = Crypto.decrypt(token);
    await Resolver(validateToken.accessToken(accessToken), {
      statusCode: 403,
      message: "token expired",
    });

    //return if title is shorter then given length;
    if (title.length <= 20)
      return res.json({
        status: false,
        message: "UNPROCESSABLE_ENTITY",
        statusCode: 422,
      } as ResHandler<"UNPROCESSABLE_ENTITY">);

    //trim the title
    const trimmedTitle = title.split(" ").slice(0, 4).join(" ");

    //generate slug
    const slug = slugify(trimmedTitle, { lower: true });

    //check for existing slug in database
    const isSlugExists = await Resolver(
      findOneOperation<Article>(
        articleCollection,
        {
          slug: { $eq: slug },
        },
        { projection: { slug: 1 } }
      )
    );

    //if slug exists generate a new slug form title
    let newTrimmedTitle, newSlug;
    if (isSlugExists) {
      newTrimmedTitle = title.split(" ").slice(1, 5).join(" ");
      newSlug = slugify(newTrimmedTitle, { lower: true });
    }

    if (newSlug) {
      //check for second newly generated slug in database
      const isNewSlugExists = await Resolver(
        findOneOperation<Article>(
          articleCollection,
          {
            slug: { $eq: newSlug },
          },
          { projection: { slug: 1 } }
        )
      );

      //if second newly generated slug exists then return with message
      if (isNewSlugExists) {
        return res.json({
          status: false,
          message:
            "Try to provide a more unique title, avoid using comming words such as 'a', 'the', 'is', 'or'",
          statusCode: 422,
        } as ResHandler);
      }
    }

    //otherwise return the slug along with other response values
    res.json({
      status: true,
      statusCode: 200,
      slug: newSlug ? newSlug : slug,
    } as ResHandler);
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
