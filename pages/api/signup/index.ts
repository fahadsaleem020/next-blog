import {
  connectHandler,
  tokenGenerator,
  Crypto,
  findOneOperation,
  userData,
  Resolver,
  getParsedCookies,
  validateOrGenerateSessionId,
  insertOneOperation,
  setCookie,
} from "@utils/index";
import { PageConfig } from "next";
import { ResHandler, Req, Res, CookieOptions } from "@Types/api/index";
import {
  parseForm,
  csrfToken,
  isUserLoggedIn,
  preventGetRequest,
} from "@middlewares/index";
import { connectToDatabase } from "@config/client.config";
import { Collection, Document } from "mongodb";
import {
  Payload,
  sessionModel,
  SignupFormModel,
  userModel,
} from "@models/index";
import { hash } from "bcrypt";
import { DeviceInfoType } from "@Types/global/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(isUserLoggedIn)
  .use(parseForm)
  .use(csrfToken)
  .post(async (req: Req, res: Res) => {
    //client instance;
    const dbClient = await (
      await Resolver(connectToDatabase(), {
        message: "SERVICE_UNAVAILABLE",
        statusCode: 503,
      })
    ).db;

    //users collection;
    const usersCollection: Collection<Document> = dbClient.collection("users");

    //session collection;
    const sessionCollection: Collection<Document> =
      dbClient.collection("sessions");

    //cookie;
    const cookie = getParsedCookies(req);

    //sessionId;
    const sessionId = validateOrGenerateSessionId(cookie.sessionId);

    //form data;
    const { email, password, client, os, device, remember } =
      userData.genericFormData<SignupFormModel & DeviceInfoType>(req);

    //check if an account with role "admin" already exists in database;
    const isAdminExists = await Resolver(
      findOneOperation<userModel>(usersCollection, {
        role: "admin",
      })
    );

    if (isAdminExists) {
      return res.json(<ResHandler<"FORBIDDEN">>{
        message: <string>"Something went wrong.",
        status: false,
        statusCode: 403,
      });
    }

    //user doc;
    const userDoc: userModel = {
      authTypes: ["manual"],
      email: email,
      password: await Resolver(hash(password, 10), {
        message: "Hashing failed",
        statusCode: 500,
      }),
      photos: [{ manual: null }],
      role: "admin",
      userNames: [{ manual: email.slice(0, email.indexOf("@")) }],
      verified: true,
    };

    //session doc;
    const sessionDoc: sessionModel = {
      createdAt: new Date(),
      updatedAt: new Date(),
      email: email,
      isLoggedIn: true,
      sessionId,
      deviceInfo: { client, device, os },
    };

    //insert new user;
    const insertUser = await Resolver(
      insertOneOperation(usersCollection, userDoc)
    );

    //insert new session;
    const insertSession = await Resolver(
      insertOneOperation(sessionCollection, sessionDoc)
    );

    //payload;
    const payload: Payload = {
      email: email,
      photo: null,
      role: "admin",
      username: email.slice(0, email.indexOf("@")),
    };

    //generate refresh token;
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
      maxAge: 31556952 * 10, // 10 years (sessionId)
      sameSite: true,
    };

    //insertion acknoledgement;
    if (insertUser.acknowledged && insertSession.acknowledged) {
      //set response cookies;
      setCookie(
        res,
        [
          "_token",
          refreshToken,
          {
            ...cookieOptions,
            maxAge: remember ? 31556952 : 864000, // 1 year or 10 days (_token)
          },
        ],
        ["sessionId", sessionId, cookieOptions]
      );
      return res.json(<ResHandler<"OK">>{
        message: "OK",
        status: true,
        statusCode: 200,
        payload,
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
