import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTweet } from "@/lib/queries/tweets.queries";
import { useAuth } from "@/context/authContext";
import { Tweet, TweetsType } from "@/types/tweets.types";

export const useCreateTweet = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createTweet,
    onSuccess: (tweet: Tweet) => {
      const typesArray = Array.isArray(types) ? types : [types];

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          const newTweet = { ...tweet, user };

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  tweets: [newTweet, ...page.tweets],
                };
              }
              return page;
            }),
          };
        });
      });
    },
  });
};
