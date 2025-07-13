import { fetchTweets } from "@/lib/queries/tweets.queries";
import { TweetsType } from "@/types/tweets.types";
import { useQuery } from "@tanstack/react-query";

export const useTweets = (
  page: number,
  tweetsType: TweetsType,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["feed", tweetsType, page],
    queryFn: () => fetchTweets(page, tweetsType),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
