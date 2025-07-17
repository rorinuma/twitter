import { likeTweet } from "@/lib/queries/tweets.queries";
import { queryClient } from "@/lib/queryClient";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation } from "@tanstack/react-query";

export const useLikeTweet = (types: TweetsType | TweetsType[]) => {
  return useMutation({
    mutationFn: likeTweet,
    onSuccess: (_data, tweetId: string) => {
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
                    isLiked: true,
                    likesCount: tweet.likesCount + 1,
                  };
                } else if (isRetweet && tweet.retweetedTweet) {
                  return {
                    ...tweet,
                    retweetedTweet: {
                      ...tweet.retweetedTweet,
                      isLiked: true,
                      likesCount: tweet.retweetedTweet.likesCount + 1,
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
            isLiked: true,
            likesCount: oldData.likesCount + 1,
          };
        },
      );
    },
  });
};
