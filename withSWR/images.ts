import axios from "axios";
import useSWR from "swr";
import { ImageList } from "@Types/global";
const fetcher = async (url: string) =>
  (await (
    await axios.get(url)
  ).data) as ImageList;

export function useImageList(...args: any[]) {
  const { data, error, isValidating } = useSWR(`/api/imageList`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
  };
}
