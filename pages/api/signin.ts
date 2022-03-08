import {
  parseForm,
  validateLoginForm,
  isUserLoggedIn,
  preventGetRequest,
} from "@middlewares/index";
import { PageConfig } from "next";
import {
  connectHandler,
  getParsedCookies,
  setCookie,
  tokenGenerator,
  Crypto,
  userData,
  updateOneOperation,
  insertOneOperation,
  Resolver,
  validateOrGenerateSessionId,
} from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import {
  ResHandler,
  Req,
  Res,
  CookieOptions,
  MergeId,
  statusCodeFor,
} from "@Types/api";
import { compare } from "bcrypt";
import { sessionModel, userModel, Payload } from "@models/index";
import { Collection, Document } from "mongodb";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(isUserLoggedIn)
  .use(parseForm)
  .use(validateLoginForm)
  .post(async (req: Req, res: Res) => {
    //
    const { sessionId: SessionID } = getParsedCookies(req);
    const sessionId: string = validateOrGenerateSessionId(SessionID);

    const form = userData.loginFormData(req);

    const db = await (
      await Resolver(connectToDatabase(), {
        statusCode: ((): statusCodeFor<"SERVICE_UNAVAILABLE"> => 503)(),
      })
    ).client.db(dbName);

    const sessionCollection: Collection<Document> = db.collection("sessions");
    const userCollection = db.collection("users");

    const user: MergeId<userModel> = await Resolver<any>(
      userCollection.findOne({
        email: req.body.email,
      })
    );

    const isUserVerified =
      user?.email === req.body.email &&
      (await Resolver(compare(req.body.password, user?.password!)));

    if (!user || !isUserVerified)
      return res.json(<ResHandler<"OK">>{
        status: false,
        message: <string>"Invalid email or password",
        statusCode: 200,
      });

    const isSessionExists = await Resolver(
      sessionCollection.findOne({
        sessionId: sessionId,
        email: req.body.email,
      })
    );

    isSessionExists
      ? await Resolver(
          updateOneOperation<sessionModel>(
            sessionCollection,
            {
              sessionId: sessionId,
              email: form.email,
            },
            {
              $set: {
                isLoggedIn: true,
                sessionId: sessionId,
                updatedAt: new Date(),
              },
            }
          )
        )
      : await Resolver(
          insertOneOperation<sessionModel>(sessionCollection, {
            email: form.email,
            isLoggedIn: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionId: sessionId,
            deviceInfo: {
              client: form.deviceInfo.client,
              device: form.deviceInfo.device,
              os: form.deviceInfo.os,
            },
          })
        );

    const payload: Payload = {
      userId: user._id?.toString(),
      username: user.userNames?.map((val) => val.manual)[0]!,
      photo: user.photos?.map((val) => val.manual)[0] ?? null,
      email: user.email!,
      role: user.role!,
    };

    const refreshToken = Crypto.encrypt(
      tokenGenerator.getRefreshToken(payload)
    );

    const isCookieSecure =
      process.env.NODE_ENV === "development" ? false : true;

    const cookieOptions: CookieOptions<"options"> = {
      httpOnly: true,
      path: "/",
      secure: isCookieSecure,
      maxAge: 31556952 * 10, // 10 years (sessionId)
      sameSite: true,
    };

    setCookie(
      res,
      [
        "_token",
        refreshToken,
        {
          ...cookieOptions,
          maxAge: form.remember ? 31556952 : 864000, // 1 year or 10 days (_token)
        },
      ],
      ["sessionId", sessionId, cookieOptions]
    );

    res.json(<ResHandler<"OK">>{
      status: true,
      message: "OK",
      statusCode: 200,
      payload: payload,
    });
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
