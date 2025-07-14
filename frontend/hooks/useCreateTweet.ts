import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTweet } from "@/lib/queries/tweets.queries";

export const useCreateTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tweets"],
        refetchType: "all",
      });
    },
  });
};
