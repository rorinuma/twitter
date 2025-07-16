import { unlikeTweet } from "@/lib/queries/tweets.queries";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUnlikeTweet = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikeTweet,
    onSuccess: (_data, tweetId) => {
      const typesArray = Array.isArray(types) ? types : [types];

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              tweets: page.tweets.map((tweet: Tweet) => {
                if (tweet.id === tweetId) {
                  return {
                    ...tweet,
                    isLiked: false,
                    likesCount: tweet.likesCount - 1,
                  };
                }
                return tweet;
              }),
            })),
          };
        });
      });
    },
  });
};
