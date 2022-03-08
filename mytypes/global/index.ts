import { Article, sessionModel } from "@models/index";
import { tailwindBeta, tailwindAlpha } from "@config/colors";
import { UpdateResult } from "mongodb";

export declare type DeviceInfoType = sessionModel["deviceInfo"];

export declare type ApiResponse = {
  message: string;
  statusCode: number;
  status: boolean;
};

export declare type LocalImages = {
  src: string;
  name: string;
  file: File;
}[];

export declare type ImageList = {
  result: {
    src: string;
    name: string;
    alt: string[];
    tag: string[];
    public_id: string;
  }[];
};

export declare type AppendType<type, MergeWith> = {
  [property in keyof type]: type[property] | MergeWith;
};

export declare type ArticleType = {
  thumbNail: AppendType<Article["thumbNail"], null>;
} & AppendType<Omit<Article, "thumbNail">, null>;

//beta
type BetaColorList = keyof typeof tailwindBeta;
type BetaShades = keyof typeof tailwindBeta["gray"];

//alpha
type AlphaColorList = keyof typeof tailwindAlpha;
type AlphaShades = keyof typeof tailwindAlpha["gray"];

//custom color type
export declare type Custom =
  | `beta.${BetaColorList}.${BetaShades}`
  | `alpha.${AlphaColorList}.${AlphaShades}`;

export declare type UploadArticleResult = ApiResponse & {
  articleInsertionResponse: UpdateResult;
  tagsInsertionResponse: UpdateResult;
};
