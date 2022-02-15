import { Payload } from "@models/index";
import { Req, Res } from "@Types/api";
import {
  connectHandler,
  userData,
  Crypto,
  validateToken,
  Resolver,
  isCookieEmpty,
} from "@utils/index";
import { PageConfig } from "next";
import { parseForm, preventGetRequest } from "./middlewares";
const handler = connectHandler();

export default handler;

handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //
    const { token } = userData.genericFormData<{ token: string }>(req);
    if (isCookieEmpty(req, "_token")) return res.end("end call");

    const user = await Resolver(
      validateToken.accessToken<Payload>(Crypto.decrypt(token))
    );

    delete (<any>user).iat;
    delete (<any>user).exp;
    res.json(user);
    //
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
