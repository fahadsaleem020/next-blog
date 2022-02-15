import { Article } from "@models/index";
import { ApiResponse } from "@Types/global";
import axios from "axios";
import useSWR from "swr";
import { ObjectID } from "bson";

type SingleArticle = ApiResponse & { article: Article & { _id: ObjectID } };

const fetcher = async (url: string) =>
  (await (
    await axios.get(url)
  ).data) as SingleArticle;

export function useSingleArticle(url: string, shouldFetch: boolean) {
  const { data, error, isValidating } = useSWR(
    shouldFetch ? "/singleArticle" : null,
    () => fetcher(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
  };
}
