import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTweet } from "@/lib/queries/tweets.queries";
import { Tweet, TweetsType } from "@/types/tweets.types";

export const useDeleteTweet = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTweet,
    onSuccess: (_data, deletedId) => {
      const typesArray = Array.isArray(types) ? types : [types];

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              tweets: page.tweets.filter((tweet: Tweet) => {
                return (
                  tweet.id != deletedId && tweet.retweetedTweet?.id != deletedId
                );
              }),
            })),
          };
        });
      });
      queryClient.setQueryData(["tweet", deletedId], undefined);
    },
  });
};
