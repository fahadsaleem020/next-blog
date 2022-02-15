import { parseForm, preventGetRequest } from "@middlewares/index";
import { ResHandler, Req, Res, statusCodeFor, CookieList } from "@Types/api";
import { PageConfig } from "next";
import {
  connectHandler,
  validateToken,
  revokeLocalSession,
  Crypto,
  updateOneOperation,
  validateOrGenerateSessionId,
  Resolver,
  getGenericCookie,
} from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { sessionModel } from "@models/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //
    const cookie = getGenericCookie<CookieList>(req, "sessionId");
    const { email } = await Resolver<{ email: string }>(
      validateToken.accessToken(Crypto.decrypt(req.body.accesstoken))
    );

    // modified
    const validatedSessionId = validateOrGenerateSessionId(cookie.sessionId);
    const sessionCollection: Collection<Document> = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).client
      .db(dbName)
      .collection("sessions");

    //update the isLoggedIn value to "false";
    await Resolver(
      updateOneOperation<sessionModel>(
        sessionCollection,
        {
          email: email,
          sessionId: validatedSessionId,
        },
        {
          $set: {
            isLoggedIn: false,
            updatedAt: new Date(),
          },
        }
      )
    );

    //remove cookie "_token"
    revokeLocalSession(res);

    return res.json({
      message: "OK",
      status: true,
      statusCode: 200,
    } as ResHandler);
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
