import { fetchTweets } from "@/lib/queries/tweets.queries";
import { TweetsType } from "@/types/tweets.types";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useTweets = (tweetsType: TweetsType, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ["tweets", tweetsType],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      if (!tweetsType) {
        throw new Error("Invalid tweetsType");
      }
      return fetchTweets({ pageParam, tweetsType });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tweetsType,
  });
};
