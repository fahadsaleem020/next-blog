import { ApiResponse } from "@Types/global";
import axios from "axios";
import useSWR from "swr";

const fetcher = async (url: string) =>
  (await (
    await axios.get(url)
  ).data) as ApiResponse & { tags: string[] };

export function useTags(...args: any[]) {
  const { data, error, isValidating } = useSWR(`/api/tags`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
  };
}
