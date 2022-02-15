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
} from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { sessionModel } from "@models/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .use(csrfToken)
  .post(async (req: Req, res: Res) => {
    const cookie = getParsedCookies(req);
    const { email } = await Resolver(
      validateToken.refreshToken<{ email: string }>(
        Crypto.decrypt(<string>cookie._token)
      )
    );

    const sessionId: string = validateOrGenerateSessionId(cookie.sessionId);

    const sessionCollection: Collection<Document> = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).client
      .db(dbName)
      .collection("sessions");

    const isSessionUpdated = await Resolver(
      updateOneOperation<sessionModel>(
        sessionCollection,
        {
          email: email,
          sessionId: sessionId,
        },
        {
          $set: {
            isLoggedIn: true,
            sessionId: sessionId,
            updatedAt: new Date(),
          },
        }
      )
    );

    return isSessionUpdated.modifiedCount
      ? res.json(<ResHandler>{
          message: "OK",
          status: true,
          statusCode: 200,
        })
      : (() => {
          revokeLocalSession(res);
          return res.json(<ResHandler<"UNAUTHORIZED">>{
            message: "UNAUTHORIZED",
            status: false,
            statusCode: 401,
          });
        })();
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
