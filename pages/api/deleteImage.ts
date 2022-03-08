import { Req, Res, ResHandler } from "@Types/api/index";
import { PageConfig } from "next";
import {
  connectHandler,
  Resolver,
  userData,
  validateToken,
  Crypto,
} from "@utils/index";
import { preventGetRequest, parseForm } from "@middlewares/index";
import { v2 as cloudinary } from "cloudinary";
import { ImageList } from "@Types/global";

const cd = cloudinary.config({
  cloud_name: process.env.cloud_name!,
  api_key: process.env.api_key!,
  api_secret: process.env.api_secret!,
  secure: true,
});

const handler = connectHandler();
handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    // get form data with fields and files
    const { accesstoken, imageData } = userData.genericFormData<{
      accesstoken: string;
      imageData: ImageList["result"][0];
    }>(req);

    // validate access token
    await Resolver(validateToken.accessToken(Crypto.decrypt(accesstoken)), {
      statusCode: 500,
      message: "Invalid access token",
    });

    // deleting image from cloudinary;
    const { result } = await Resolver<{ result: "ok" | "not found" }>(
      cloudinary.uploader.destroy(imageData.public_id)
    );

    if (result === "ok") {
      res.json(<ResHandler<"ACCEPTED">>{
        message: "ACCEPTED",
        status: true,
        statusCode: 202,
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
