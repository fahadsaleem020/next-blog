import { ArticleType, DeviceInfoType } from "@Types/global";
import { Providers } from "@Types/api";
import { ObjectId, ObjectID } from "bson";

export declare interface userModel {
  email: string;
  password: string;
  authTypes: Providers[];
  verified: boolean;
  photos: Partial<Record<Providers, string | null>>[];
  userNames: Partial<Record<Providers, string>>[];
  role: "admin" | "client";
}

export declare interface sessionModel {
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isLoggedIn: boolean;
  deviceInfo: { client: string; os: string; device: string };
  sessionId: string;
}

export declare interface LoginFormModel {
  email: string;
  password: string;
  remember: boolean;
  deviceInfo: DeviceInfoType;
}

export declare interface Payload {
  username: string;
  photo: string | null;
  email: string;
  role: userModel["role"];
}

export declare type OAuthPayload = Pick<
  userModel,
  "authTypes" | "userNames" | "email" | "photos" | "verified"
> & { isManual: boolean };

export declare interface Article {
  thumbNail: { title: string; description: string; headerPic: File };
  body: string;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
  status: "published" | "unpublished";
  slug: string;
  tags: Set<string>;
}

export declare interface ArticleDoc extends Article {
  likes: number;
  views: number;
}

export declare interface Comments {
  _id: ObjectID;
  by: string;
  photo: string;
  postid: ObjectID; //referenced
  body: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: Replies[];
}

interface Replies {
  by: string;
  photo: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies?: Replies[];
}

//test model
const comment: Comments = {
  _id: new ObjectId(),
  postid: new ObjectId(), //referenced to article
  by: "person",
  photo: "person's photo url",
  body: "some comment content",
  createdAt: new Date(),
  updatedAt: new Date(),
  likes: 20,
  replies: [
    {
      by: "person 2",
      photo: "person's photo url",
      body: "reply to content",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 30,
      replies: [
        {
          by: "person 3",
          photo: "person's photo url",
          body: "reply to content",
          createdAt: new Date(),
          updatedAt: new Date(),
          likes: 30,
        },
      ],
    },
  ],
};

export declare interface UserStoreInterface {
  user: Payload | null;
  isLoading: boolean;
  isOffline: boolean;
  setIsLoading: (val: boolean) => void;
  setIsOffline: (val: boolean) => void;
  setUser: (val: Payload | null) => void;
}

export declare interface ArticleStoreInterface extends ArticleType {
  _id: ObjectID | null;
  setArticleId: (_id: ObjectID) => void;
  setThumbNailPic: (image: File) => void;
  setThumbNailTitle: (title: string) => void;
  setThumbNailDescription: (description: string) => void;
  setArticle: (
    data: Omit<ArticleType, "thumbNail" | "slug" | "tags" | "status">
  ) => void;
  setStatus: (status: "published" | "unpublished") => void;
  setSlug: (slug: string) => void;
  setTags: (tags: Set<string>) => void;
}

export declare type GenericModel<T> = T;
