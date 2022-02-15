import axios from "axios";
import useSWR from "swr";
import { getAccessToken } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { ArticleDoc } from "@models/index";

const fetcher = async (url: string) => {
  const { token } = await getAccessToken(csrfToken);
  const articles: ArticleDoc[] = await (
    await axios.get(
      `/api/getAllArticles?accesstoken=${encodeURIComponent(token)}`
    )
  ).data;

  return articles;
};
export function useArticles(...args: []) {
  const { data, error, isValidating } = useSWR(`articles`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
  };
}
