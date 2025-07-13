import { fetchTweet } from "@/lib/queries/tweets.queries";
import { useQuery } from "@tanstack/react-query";

export const useTweet = (id: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["tweet", id],
    queryFn: () => fetchTweet(id),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
