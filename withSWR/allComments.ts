import { Comments } from "@models/index";
import axios from "axios";
import useSWR from "swr";

export const fetcher = async (args: string) =>
  (await (
    await axios.get(args)
  ).data) as { comments: Comments[] };

export function useComments(args: string) {
  const { data, error, isValidating, mutate } = useSWR(
    `allComments`,
    () => fetcher(args),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
    mutate,
  };
}
