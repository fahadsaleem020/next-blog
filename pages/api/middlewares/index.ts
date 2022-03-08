import { Req, Res, ResHandler, statusCodeFor } from "@Types/api";
import { NextHandler } from "next-connect";
import formidable from "formidable";
import { object, string } from "yup";
import {
  isGenericCookieEmpty,
  userData,
  validateOrGenerateSessionId,
} from "pages/api/utils/index";
import {
  getParsedCookies,
  Crypto,
  validateToken,
  Resolver,
} from "@utils/index";
import { updateOneOperation, revokeLocalSession } from "@utils/index";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { sessionModel } from "@models/index";

export const csrfToken = async (req: Req, res: Res, next: NextHandler) =>
  req.body.csrftoken !== process.env.NEXT_PUBLIC_CSRF_TOKEN
    ? next(
        Error(
          JSON.stringify({
            message: "forgery prevented",
            statusCode: ((): statusCodeFor<"FORBIDDEN"> => 403)(),
          })
        )
      )
    : next();

export const parseForm = async (req: Req, res: Res, next: NextHandler) => {
  const form = formidable();
  req.body = await new Promise((resolve, reject) =>
    form.parse(req, (err, fields) =>
      err ? reject({ message: "formidable failure" }) : resolve(fields)
    )
  );
  next();
};

export const parseFormWithFiles = async (
  req: Req,
  res: Res,
  next: NextHandler
) => {
  const form = formidable({ multiples: true });
  req.body = await new Promise((resolve, reject) =>
    form.parse(req, (e, fields, files) =>
      e
        ? reject({ message: e.message })
        : resolve({ fields, files: Object.entries(files) })
    )
  );
  next();
};

export const validateLoginForm = async (
  req: Req,
  res: Res,
  next: NextHandler
) => {
  await Resolver(
    object()
      .shape({
        email: string().required("Email is required").email("Invalid email"),
        password: string().required("Password is required"),
        deviceInfo: object({
          client: string().required("client name is required"),
          os: string().required("os name is required"),
          device: string().required("device name is required"),
        }),
      })
      .validate(userData.loginFormData(req)),
    {
      statusCode: ((): statusCodeFor<"BAD_REQUEST"> => 400)(),
    }
  );

  next();
};

// modified
export const isUserLoggedIn = async (req: Req, res: Res, next: NextHandler) => {
  const { sessionId, _token } = getParsedCookies(req);
  if (isGenericCookieEmpty(req, "_token")) return next();
  const { email } = await Resolver<{ email: string }>(
    validateToken.refreshToken(Crypto.decrypt(<string>_token))
  );
  try {
    if (
      await Resolver(validateToken.refreshToken(Crypto.decrypt(<string>_token)))
    )
      return res.json(<ResHandler<"UNAUTHORIZED">>{
        message: <string>"Already logged in",
        status: false,
        statusCode: 401,
      });

    return next();
  } catch (err) {
    // logout process begin
    console.log("Error: ", (<Error>err).message);
    const validatedSessionId: string = validateOrGenerateSessionId(sessionId);
    const sessionCollection: Collection<Document> = await (
      await Resolver(connectToDatabase())
    ).client
      .db(dbName)
      .collection("sessions");

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
            sessionId: validatedSessionId,
            updatedAt: new Date(),
          },
        }
      )
    );
    revokeLocalSession(res);
    //end

    return res.json(<ResHandler<"UNPROCESSABLE_ENTITY">>{
      message: <string>"tempered token",
      status: false,
      statusCode: 422,
    });
  }
};

export const preventGetRequest = (req: Req, res: Res, next: NextHandler) => {
  if (req.method !== "POST") return res.end("forbidden");
  next();
};
