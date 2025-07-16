import { likeTweet } from "@/lib/queries/tweets.queries";
import { queryClient } from "@/lib/queryClient";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation } from "@tanstack/react-query";

export const useLikeTweet = (types: TweetsType | TweetsType[]) => {
  return useMutation({
    mutationFn: likeTweet,
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
                  console.log(
                    "iterating over a tweet",
                    tweet,
                    tweet.likesCount + 1,
                  );
                  return {
                    ...tweet,
                    isLiked: true,
                    likesCount: tweet.likesCount + 1,
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
