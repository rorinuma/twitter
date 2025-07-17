import { addBookmark } from "@/lib/queries/tweets.queries";
import { Tweet, TweetsType } from "@/types/tweets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddBookmark = (types: TweetsType | TweetsType[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBookmark,
    onSuccess: (_data, tweetId) => {
      const typesArray = Array.isArray(types) ? types : [types];

      typesArray.forEach((type) => {
        queryClient.setQueryData(["tweets", type], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              return {
                ...page,
                tweets: page.tweets.map((tweet: Tweet) => {
                  const isOriginal = tweet.id === tweetId;
                  const isRetweet = tweet.retweetedTweet?.id === tweetId;

                  if (isOriginal) {
                    return {
                      ...tweet,
                      isBookmarked: true,
                      bookmarksCount: tweet.bookmarksCount + 1,
                    };
                  } else if (isRetweet && tweet.retweetedTweet) {
                    return {
                      ...tweet,
                      retweetedTweet: {
                        ...tweet.retweetedTweet,
                        isBookmarked: true,
                        bookmarksCount: tweet.retweetedTweet.bookmarksCount + 1,
                      },
                    };
                  }
                  return tweet;
                }),
              };
            }),
          };
        });
      });

      queryClient.setQueryData(
        ["tweet", tweetId],
        (oldData: Tweet | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            isBookmarked: true,
            bookmarksCount: oldData.bookmarksCount + 1,
          };
        },
      );
    },
  });
};
