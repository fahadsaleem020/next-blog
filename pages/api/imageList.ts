import { Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import { connectHandler, Resolver } from "@utils/index";
import { v2 as cloudinary, ResourceApiResponse } from "cloudinary";

//put the sdk credentials in enviroment
// middlewares
const cd = cloudinary.config({
  cloud_name: "dmoh4xaph",
  api_key: "744285782813594",
  api_secret: "hqjsqktQP2xj_c6e62YqVV2RyGM",
  secure: true,
});

const handler = connectHandler();
handler.get(async (req: Req, res: Res) => {
  //fetching multiple images
  const { resources }: ResourceApiResponse = await Resolver(
    cloudinary.api.resources({
      prefix: "blogImageGallery",
      type: "upload",
      tag: true,
      tags: true,
      max_results: 100,
    }),
    { message: "cloudinary error" }
  );
  const images = resources.map((val) => ({
    src: val.secure_url,
    name: val.public_id,
    alt: val.tags,
    tag: val.tags,
    public_id: val.public_id,
  }));

  res.json({
    result: images,
  });
});

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
