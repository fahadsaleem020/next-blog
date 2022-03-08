import {
  connectHandler,
  Crypto,
  userData,
  validateToken,
  tokenGenerator,
  getParsedCookies,
  setCookie,
  Resolver,
  updateOneOperation,
  findOneOperation,
  insertOneOperation,
  validateOrGenerateSessionId,
} from "@utils/index";
import { PageConfig } from "next";
import { ResHandler, Req, Res, CookieOptions } from "@Types/api/index";
import {
  isUserLoggedIn,
  parseForm,
  preventGetRequest,
} from "@middlewares/index";
import { connectToDatabase } from "@config/client.config";
import { Collection, Document, WithId } from "mongodb";
import {
  LoginFormModel,
  OAuthPayload,
  Payload,
  sessionModel,
  userModel,
} from "@models/index";

const handler = connectHandler();
handler
  .use(preventGetRequest)
  .use(isUserLoggedIn)
  .use(parseForm)
  .post(async (req: Req, res: Res) => {
    //
    const cookie = getParsedCookies(req);
    const sessionId: string = validateOrGenerateSessionId(cookie.sessionId);

    const dbClient = (
      await Resolver(connectToDatabase(), { message: "from here" })
    ).db;
    const sessionCollection: Collection<Document> =
      dbClient.collection("sessions");
    const usersCollection: Collection<Document> = dbClient.collection("users");

    //form data
    const { token, deviceInfo } = userData.genericFormData<
      { token: string } & Pick<LoginFormModel, "deviceInfo">
    >(req);

    //token data
    const { email, userNames, photos, authTypes } = await Resolver(
      validateToken.accessToken<OAuthPayload>(token),
      {
        statusCode: 403,
        message: "session expired",
      }
    );

    //update session
    const { modifiedCount } = await Resolver(
      updateOneOperation<sessionModel>(
        sessionCollection,
        { sessionId: sessionId, email: email },
        {
          $set: {
            email: email,
            isLoggedIn: true,
            updatedAt: new Date(),
            sessionId: sessionId,
            deviceInfo: deviceInfo,
          },
        }
      )
    );

    //create session if not updated
    const sessionInsert = !modifiedCount
      ? await Resolver(
          insertOneOperation<sessionModel>(sessionCollection, {
            email: email,
            isLoggedIn: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionId: sessionId,
            deviceInfo: deviceInfo,
          })
        )
      : null;

    //finding user role from users collection;
    const user = await Resolver(
      findOneOperation<WithId<userModel>>(
        usersCollection,
        {
          email: email,
        },
        { projection: { role: 1 } }
      )
    );

    const isCookieSecure =
      process.env.NODE_ENV === "development" ? false : true;
    const cookieOptions: CookieOptions<"options"> = {
      httpOnly: true,
      path: "/",
      secure: isCookieSecure,
      maxAge: 31556952 * 10, // 10 years, the sessionId or device expiry time
      sameSite: true,
    };

    const payload: Payload = {
      userId: user?._id.toString(),
      username: userNames?.map(
        (val) => val[authTypes?.map((val) => val)[0]]
      )[0]!,
      photo:
        photos?.map((val) => val[authTypes?.map((val) => val)[0]])[0] ?? null,
      email: email,
      role: user?.role ?? "client",
    };

    const refreshToken = Crypto.encrypt(
      tokenGenerator.getRefreshToken(payload)
    );

    modifiedCount || sessionInsert?.acknowledged
      ? (() => {
          setCookie(
            res,
            [
              "_token",
              refreshToken,
              {
                ...cookieOptions,
                maxAge: 31556952, // 1 year or 10 days
              },
            ],
            ["sessionId", sessionId, cookieOptions]
          );
          res.json(<ResHandler<"OK">>{
            message: "OK",
            status: true,
            statusCode: 200,
          });
        })()
      : res.json(<ResHandler<"FORBIDDEN">>{
          message: "FORBIDDEN",
          status: true,
          statusCode: 403,
        });
    //
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
