import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTweet } from "@/lib/queries/tweets.queries";

export const useDeleteTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tweets"],
        refetchType: "all",
      });
    },
  });
};
