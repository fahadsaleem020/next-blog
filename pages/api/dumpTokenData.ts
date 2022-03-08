import { Payload } from "@models/index";
import { CookieList, Req, Res } from "@Types/api";
import {
  connectHandler,
  userData,
  Crypto,
  validateToken,
  Resolver,
  isGenericCookieEmpty,
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

    // modified
    if (isGenericCookieEmpty<CookieList>(req, "_token")) {
      await Resolver(
        Promise.reject({
          message: "thrown from dumpToken (in testing mode), cookie Empty",
        }),
        {
          statusCode: 403,
        }
      );
    }

    const user = await Resolver(
      validateToken.accessToken<Payload>(Crypto.decrypt(token))
    );

    delete user.userId;
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
