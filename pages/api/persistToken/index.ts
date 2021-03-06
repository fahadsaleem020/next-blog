import { parseForm, csrfToken, preventGetRequest } from "@middlewares/index";
import { ResHandler, Req, Res, statusCodeFor } from "@Types/api";
import { PageConfig } from "next";
import {
  connectHandler,
  getParsedCookies,
  Crypto,
  validateToken,
  tokenGenerator,
  revokeLocalSession,
  updateOneOperation,
  Resolver,
  validateOrGenerateSessionId,
  isJson,
  isGenericCookieEmpty,
} from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { Payload, sessionModel } from "@models/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .use(csrfToken)
  .post(async (req: Req, res: Res) => {
    //
    const { _token, sessionId: SessionID } = getParsedCookies(req);

    if (
      isGenericCookieEmpty(req, "_token") ||
      isGenericCookieEmpty(req, "sessionId")
    )
      await Resolver(Promise.reject({ message: "session/token" }), {
        statusCode: 403,
      });

    try {
      const jwt = Crypto.decrypt(<string>_token);
      const payload = await validateToken.refreshToken<Payload>(jwt);

      delete (<any>payload).iat;
      const accessToken = Crypto.encrypt(
        tokenGenerator.getAccessToken(payload)
      );

      res.json(<ResHandler<"OK">>{
        status: true,
        message: "OK",
        statusCode: 200,
        token: accessToken,
      });
    } catch (error) {
      const isMessageCustom = isJson((<Error>error).message);
      const parsedErr = isMessageCustom
        ? JSON.parse((<Error>error).message)
        : (<Error>error).message;
      console.log("CatchedServerLog: ", parsedErr);
      // modified
      const sessionId: string = validateOrGenerateSessionId(SessionID);

      const sessionCollection: Collection<Document> = await (
        await Resolver(connectToDatabase())
      ).client
        .db(dbName)
        .collection("sessions");

      await Resolver(
        updateOneOperation<sessionModel>(
          sessionCollection,
          {
            sessionId: sessionId,
          },
          {
            $set: {
              isLoggedIn: false,
              sessionId: sessionId,
              updatedAt: new Date(),
            },
          }
        )
      );
      revokeLocalSession(res);

      //close connection;
      const { client } = await Resolver(connectToDatabase(), {
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
        message: "failed  to close connection",
      });
      await client.close();

      res.json(<ResHandler>{
        message: "UNPROCESSABLE_ENTITY",
        status: false,
        statusCode: 422,
      });
    }
  });

export default handler;

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
