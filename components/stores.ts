import {
  Payload,
  UserStoreInterface,
  ArticleStoreInterface,
} from "@models/index";
import { MergeId } from "@Types/api";
import create from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

export const useUser = create<UserStoreInterface>(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      isOffline: false,
      setIsLoading: (val: boolean) => set({ isLoading: val }),
      setIsOffline: (val: boolean) => set({ isOffline: val }),
      setUser: (val: Payload | null) => set({ user: val }),
    }),
    { name: "userStore" }
  )
);

export const useArticle = create<ArticleStoreInterface>(
  devtools(
    (set, get) => ({
      _id: null,
      thumbNail: { title: null, headerPic: null, description: null },
      body: null,
      createdAt: null,
      readTime: null,
      status: "unpublished",
      updatedAt: null,
      slug: null,
      tags: null,
      setThumbNailPic: (image) =>
        set(
          produce((state: ArticleStoreInterface) => {
            state.thumbNail.headerPic = image;
          })
        ),
      setThumbNailTitle: (title) =>
        set(
          produce((state: ArticleStoreInterface) => {
            state.thumbNail.title = title;
          })
        ),
      setThumbNailDescription: (description) =>
        set(
          produce((state: ArticleStoreInterface) => {
            state.thumbNail.description = description;
          })
        ),
      setArticle: (data) => set({ ...data }),
      setStatus: (status) => set({ status }),
      setSlug: (slug) => set({ slug }),
      setTags: (tags) => set({ tags: tags }),
      setArticleId: (_id) => set({ _id }),
    }),
    { name: "articleStore" }
  )
);
