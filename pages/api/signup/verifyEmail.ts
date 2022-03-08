import {
  connectHandler,
  Crypto,
  userData,
  validateToken,
  tokenGenerator,
  insertOneOperation,
  getParsedCookies,
  setCookie,
  Resolver,
  validateOrGenerateSessionId,
  findOneOperation,
} from "@utils/index";
import { PageConfig } from "next";
import {
  ResHandler,
  Req,
  Res,
  CookieOptions,
  statusCodeFor,
} from "@Types/api/index";
import { parseForm, isUserLoggedIn } from "@middlewares/index";
import { connectToDatabase } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { OAuthPayload, Payload, sessionModel, userModel } from "@models/index";
import { DeviceInfoType } from "@Types/global";

const handler = connectHandler();
handler
  .use(isUserLoggedIn)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //
    const cookie = getParsedCookies(req);
    const sessionId: string = validateOrGenerateSessionId(cookie.sessionId);

    //client instance;
    const dbClient = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).db;

    const usersCollection: Collection<Document> = dbClient.collection("users");
    const sessionCollection: Collection<Document> =
      dbClient.collection("sessions");

    //form data  (additional fields can be retrieved from here)
    const { client, device, os, token, remember } = userData.genericFormData<
      DeviceInfoType & { token: string; remember: boolean }
    >(req);

    //token data
    const { authTypes, email, photos, userNames, verified } = await Resolver(
      validateToken.accessToken<OAuthPayload>(token),
      {
        statusCode: 403,
        message: "session expired",
      }
    );

    //user doc
    const userDoc: Omit<userModel, "password"> = {
      authTypes,
      email,
      photos,
      userNames,
      verified,
      role: "client",
    };

    //check if user already exists
    const isUserExists = await Resolver(
      findOneOperation<userModel>(usersCollection, {
        email: email,
      })
    );

    if (isUserExists)
      return res.json(<ResHandler>{
        message: "Ambiguous user ",
        status: false,
        statusCode: 422,
      });

    //insert new user
    const insertUser = await Resolver(
      insertOneOperation<Omit<userModel, "password">>(usersCollection, userDoc)
    );

    //insert new session
    const insertSession = await Resolver(
      insertOneOperation<sessionModel>(sessionCollection, {
        email,
        sessionId,
        deviceInfo: { client, device, os },
        createdAt: new Date(),
        updatedAt: new Date(),
        isLoggedIn: true,
      })
    );

    //payload
    const payload: Payload = {
      userId: insertUser.insertedId.toString(),
      email: email,
      photo: photos[0][authTypes[0]]!,
      role: "client",
      username: userNames[0][authTypes[0]]!,
    };

    //generate new refresh token
    const refreshToken = Crypto.encrypt(
      tokenGenerator.getRefreshToken(payload)
    );

    const isCookieSecure =
      process.env.NODE_ENV === "development" ? false : true;

    //default cookie options;
    const cookieOptions: CookieOptions<"options"> = {
      httpOnly: true,
      path: "/",
      secure: isCookieSecure,
      maxAge: 31556952 * 10, // 10 years, the sessionId or device expiry time
      sameSite: true,
    };

    //insertion acknowledgement;
    if (insertUser.acknowledged && insertSession.acknowledged) {
      setCookie(
        res,
        [
          "_token",
          refreshToken,
          {
            ...cookieOptions,
            maxAge: remember ? 31556952 : 864000, // 1 year or 10 days
          },
        ],
        ["sessionId", sessionId, cookieOptions]
      );
      return res.json(<ResHandler<"OK">>{
        message: "OK",
        status: true,
        statusCode: 200,
      });
    }

    //failed response;
    res.json(<ResHandler<"FORBIDDEN">>{
      message: "FORBIDDEN",
      status: false,
      statusCode: 403,
    });
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
