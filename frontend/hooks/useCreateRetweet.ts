import { useAuth } from "@/context/authContext";
import { createRetweet } from "@/lib/queries/tweets.queries";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateRetweet = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createRetweet,
    onSuccess: (retweet: Tweet) => {
      const typesArray = Array.isArray(types) ? types : [types];
      const originalTweetId = retweet.originalTweetId;

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          let retweetedTweet: Tweet | undefined;
          for (const page of oldData.pages) {
            retweetedTweet = page.tweets.find(
              (t: Tweet) => t.id === originalTweetId,
            );
            if (retweetedTweet) break;
          }

          if (retweetedTweet) {
            retweetedTweet = {
              ...retweetedTweet,
              retweetsCount: retweetedTweet.retweetsCount + 1,
              isRetweeted: true,
            };
          }

          const newRetweet = {
            ...retweet,
            user,
            retweetedTweet,
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              return {
                ...page,
                tweets: [
                  ...(index === 0 ? [newRetweet] : []),
                  ...page.tweets.map((tweet: Tweet) => {
                    if (tweet.id === originalTweetId) {
                      return {
                        ...tweet,
                        retweetsCount: tweet.retweetsCount + 1,
                        isRetweeted: true,
                      };
                    }
                    return tweet;
                  }),
                ],
              };
            }),
          };
        });
      });
    },
  });
};
