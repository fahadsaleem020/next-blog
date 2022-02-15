import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export declare type Providers = "manual" | "google" | "facebook" | "yahoo";
export declare type ProvidersList = Record<Providers, string>[];

export declare type CookieType = {
  sessionId: string | false;
  _token: string | false;
  [key: string]: string | false;
};

export declare type CookieList<T = Pick<CookieType, "sessionId" | "_token">> =
  keyof {
    [property in keyof T]: string;
  };

export declare type CookieOptions<T extends "props" | "options"> =
  T extends "props"
    ? Parameters<typeof serialize>
    : Parameters<typeof serialize>[2];

export declare type MergeId<T, I = true> = Partial<
  I extends true ? T & { _id: string } : T
>;

export declare type Req = NextApiRequest;
export declare type Res<T = any> = NextApiResponse<T>;

export declare type statusCodeFor<T extends keyof HttpStatusCodeList> =
  HttpStatusCodeList[T];

export declare type ResHandler<T = {} | keyof HttpStatusCodeList> =
  | {
      status?: boolean;
      message?: T;
      statusCode?: HttpStatusCodeList[T extends keyof HttpStatusCodeList
        ? T
        : keyof HttpStatusCodeList];
    }
  | keyof HttpStatusCodeList;

export declare type HttpStatusCodeList = {
  CONTINUE: 100;
  SWITCHING_PROTOCOLS: 101;
  PROCESSING: 102;
  OK: 200;
  CREATED: 201;
  ACCEPTED: 202;
  NON_AUTHORITATIVE_INFORMATION: 203;
  NO_CONTENT: 204;
  RESET_CONTENT: 205;
  PARTIAL_CONTENT: 206;
  MULTI_STATUS: 207;
  ALREADY_REPORTED: 208;
  IM_USED: 226;
  MULTIPLE_CHOICES: 300;
  MOVED_PERMANENTLY: 301;
  FOUND: 302;
  SEE_OTHER: 303;
  NOT_MODIFIED: 304;
  USE_PROXY: 305;
  SWITCH_PROXY: 306;
  TEMPORARY_REDIRECT: 307;
  PERMANENT_REDIRECT: 308;
  BAD_REQUEST: 400;
  UNAUTHORIZED: 401;
  PAYMENT_REQUIRED: 402;
  FORBIDDEN: 403;
  NOT_FOUND: 404;
  METHOD_NOT_ALLOWED: 405;
  NOT_ACCEPTABLE: 406;
  PROXY_AUTHENTICATION_REQUIRED: 407;
  REQUEST_TIMEOUT: 408;
  CONFLICT: 409;
  GONE: 410;
  LENGTH_REQUIRED: 411;
  PRECONDITION_FAILED: 412;
  PAYLOAD_TOO_LARGE: 413;
  URI_TOO_LONG: 414;
  UNSUPPORTED_MEDIA_TYPE: 415;
  RANGE_NOT_SATISFIABLE: 416;
  EXPECTATION_FAILED: 417;
  I_AM_A_TEAPOT: 418;
  MISDIRECTED_REQUEST: 421;
  UNPROCESSABLE_ENTITY: 422;
  LOCKED: 423;
  FAILED_DEPENDENCY: 424;
  UPGRADE_REQUIRED: 426;
  PRECONDITION_REQUIRED: 428;
  TOO_MANY_REQUESTS: 429;
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431;
  UNAVAILABLE_FOR_LEGAL_REASONS: 451;
  INTERNAL_SERVER_ERROR: 500;
  NOT_IMPLEMENTED: 501;
  BAD_GATEWAY: 502;
  SERVICE_UNAVAILABLE: 503;
  GATEWAY_TIMEOUT: 504;
  HTTP_VERSION_NOT_SUPPORTED: 505;
  VARIANT_ALSO_NEGOTIATES: 506;
  INSUFFICIENT_STORAGE: 507;
  LOOP_DETECTED: 508;
  NOT_EXTENDED: 510;
  NETWORK_AUTHENTICATION_REQUIRED: 511;
};
