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
  isCookieEmpty,
  Resolver,
  validateOrGenerateSessionId,
  isJson,
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

    if (isCookieEmpty(req, "_token") || isCookieEmpty(req, "sessionId"))
      return await Resolver(
        Promise.reject({ message: "empty session/token" }),
        {
          statusCode: 403,
        }
      );

    try {
      const jwt = Crypto.decrypt(<string>_token);
      const payload = await validateToken.refreshToken<Payload>(jwt);

      if (payload.role === "client") {
        return res.json(<ResHandler<"UNAUTHORIZED">>{
          message: "UNAUTHORIZED",
          status: false,
          statusCode: 401,
        });
      }
      delete (<any>payload).iat;
      const accessToken = Crypto.encrypt(
        tokenGenerator.getAccessToken(payload)
      );

      delete (<any>accessToken).iat;
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
