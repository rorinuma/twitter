import { deleteRetweet } from "@/lib/queries/tweets.queries";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteRetweet = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRetweet,
    onSuccess: ({ originalTweetId, retweetsCount }) => {
      const typesArray = Array.isArray(types) ? types : [types];

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              tweets: page.tweets
                .filter(
                  (tweet: Tweet) => tweet.originalTweetId !== originalTweetId,
                )
                .map((tweet: Tweet) =>
                  tweet.id === originalTweetId
                    ? {
                        ...tweet,
                        retweetsCount,
                        isRetweeted: false,
                      }
                    : tweet,
                ),
            })),
          };
        });
      });
    },
  });
};
