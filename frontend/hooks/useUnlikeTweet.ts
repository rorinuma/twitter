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
                const isOriginal = tweet.id === tweetId;
                const isRetweet = tweet.retweetedTweet?.id === tweetId;
                if (isOriginal) {
                  return {
                    ...tweet,
                    isLiked: false,
                    likesCount: tweet.likesCount - 1,
                  };
                } else if (isRetweet && tweet.retweetedTweet) {
                  return {
                    ...tweet,
                    retweetedTweet: {
                      ...tweet.retweetedTweet,
                      isLiked: false,
                      likesCount: tweet.retweetedTweet?.likesCount - 1,
                    },
                  };
                }
                return tweet;
              }),
            })),
          };
        });
      });

      queryClient.setQueryData(
        ["tweet", tweetId],
        (oldData: Tweet | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            isLiked: false,
            likesCount: oldData.likesCount - 1,
          };
        },
      );
    },
  });
};
