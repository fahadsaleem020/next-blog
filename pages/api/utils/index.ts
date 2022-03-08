import { LoginFormModel } from "@models/index";
import { CookieOptions, CookieType, Req, Res } from "@Types/api";
import { validate, v4 as uuid } from "uuid";
import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import crypto from "crypto-js";
import NextConnect from "next-connect";
import {
  Collection,
  Filter,
  FindCursor,
  FindOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
  Document,
  DeleteResult,
} from "mongodb";
import formidable from "formidable";

export const connectHandler = (
  defaultError = {
    message: "INTERNAL_SERVER_ERROR",
    status: false,
    statusCode: 500,
  }
) =>
  NextConnect({
    onNoMatch: (req: Req, res: Res) => res.end("forbidden"),
    onError: (error: Error, req: Req, res: Res) => {
      const isMessageCustom = isJson(error?.message);
      const parsedErr = isMessageCustom
        ? JSON.parse(error.message)
        : error.message;
      console.log("ServerLog: ", parsedErr);
      isMessageCustom
        ? res.json({
            ...parsedErr,
            message: parsedErr.message,
            statusCode: parsedErr.statusCode,
            status: false,
          })
        : res.json(defaultError);
    },
  });

export const Resolver = async <T = {}>(
  p: Promise<T>,
  options?: {
    message?: string;
    statusCode?: number;
    [key: string]: any;
  }
) => {
  return p
    .then((res) => res)
    .catch((e) => {
      throw new Error(
        JSON.stringify({
          ...options,
          message: options?.message ?? (<Error>e).message,
          statusCode: options?.statusCode ?? 500,
        })
      );
    });
};

export const getParsedCookies = (req: Req): CookieType => ({
  _token: req.cookies._token ?? false,
  sessionId: req.cookies.sessionId ?? false,
});

//new
export const getGenericCookie = <T extends string>(
  req: Req,
  cookieName: T
): {
  [x in T]: string;
} =>
  ({
    [cookieName]: req.cookies[cookieName] ?? false,
  } as {
    [x in T]: string;
  });

// modified
export const isGenericCookieEmpty = <T extends string>(req: Req, cookie: T) => {
  return req.cookies && req.cookies[cookie] ? false : true;
};

export const validateOrGenerateSessionId = (sessionId: string | boolean) =>
  sessionId && validate(<string>sessionId) ? <string>sessionId : uuid();

// modified
export const validateToken = {
  refreshToken: <T>(refreshToken: string): Promise<T> =>
    new Promise((resolve, reject) => {
      verify(refreshToken, process.env.REFRESH_TOKEN!, (error, payload) =>
        error ? reject(error) : resolve(<T>payload)
      );
    }),
  accessToken: <T>(accessToken: string): Promise<T> =>
    new Promise((resolve, reject) => {
      verify(accessToken, process.env.ACCESS_TOKEN!, (error, payload) =>
        error ? reject(error) : resolve(<T>payload)
      );
    }),
};

export const userData = {
  loginFormData: (req: Req) => <LoginFormModel>req.body,
  genericFormData: <T>(req: Req) => <T>req.body,
  genericFormDataWithFiles: <
    Fields extends {
      fields: unknown;
    },
    T = Fields & { files: [string, formidable.File][] }
  >(
    req: Req
  ) => <T>req.body,
};

export const updateOneOperation = async <T>(
  collection: Collection<Document>,
  queryfilter: Filter<T>,
  Doc: UpdateFilter<T> | Partial<T>,
  updateOptions?: UpdateOptions
): Promise<UpdateResult> => {
  console.log("updated");
  return (await collection.updateOne(
    <any>queryfilter,
    <any>Doc,
    <any>updateOptions
  )) as unknown as UpdateResult;
};

export const insertOneOperation = async <T>(
  collection: Collection<Document>,
  Doc: T
) => {
  console.log("inserted");
  return await collection.insertOne(<any>Doc);
};

export const findOneOperation = async <T>(
  collection: Collection<Document>,
  queryfilter: Filter<T>,
  options?: FindOptions<T>
): Promise<T | null> => await collection.findOne(<any>queryfilter, options);

export const deleteOneOperation = async <T>(
  collection: Collection<Document>,
  queryfilter: Filter<T>
): Promise<DeleteResult> =>
  await collection.deleteOne(<Filter<Document>>queryfilter);

export const deleteOperation = async <T>(
  collection: Collection<Document>,
  queryfilter: Filter<T>
): Promise<DeleteResult> =>
  await collection.deleteMany(<Filter<Document>>queryfilter);

export const findOperation = async <T>(
  collection: Collection<Document>,
  queryfilter: Filter<T>,
  options?: FindOptions<T>
): Promise<FindCursor<WithId<T>>> =>
  (await collection.find(<any>queryfilter, options)) as any;

// modified
export const setCookie = (res: Res, ...data: CookieOptions<"props">[]) =>
  res.setHeader(
    "Set-Cookie",
    data.map((val) => serialize(...val))
  );

export const revokeLocalSession = (res: Res) =>
  res.setHeader(
    "Set-Cookie",
    serialize("_token", "", {
      httpOnly: true,
      path: "/",
      secure: true,
      maxAge: 1,
      sameSite: true,
    })
  );

export const tokenGenerator = {
  getRefreshToken: (payload: object) =>
    sign(payload, process.env.REFRESH_TOKEN!),
  /**
   * Delete iat property from a payload if dumping that payload into 'getAccessToken' method
   * Default expiry is 10 seconds
   */
  getAccessToken: (payload: object, expiresIn: string | number = 10) =>
    sign(payload, process.env.ACCESS_TOKEN!, {
      expiresIn: expiresIn,
    }),
};

export const Crypto = {
  encrypt: (data: string) =>
    crypto.AES.encrypt(data, process.env.ENCRYPTION_KEY!).toString(),
  decrypt: (data: string) =>
    crypto.AES.decrypt(data, process.env.ENCRYPTION_KEY!).toString(
      crypto.enc.Utf8
    ),
};

export const isJson = (data: string) => {
  try {
    JSON.parse(data);
    return true;
  } catch (err) {
    return false;
  }
};
