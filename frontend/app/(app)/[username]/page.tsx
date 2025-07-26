"use client";

import Spinner from "@/components/ui/decorations/Spinner";
import { useEffect } from "react";
import { useTweets } from "@/hooks/useTweetFeed";
import TweetCard from "@/components/tweets";
import { useInView } from "react-intersection-observer";
import { useOwner } from "@/context/OwnerContext";
import { useQueryClient } from "@tanstack/react-query";

export default function UserProfile() {
  const owner = useOwner();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: postsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTweets("posts", !!owner, owner?.id);

  useEffect(() => {
    if (owner?.id) {
      queryClient.invalidateQueries({
        queryKey: ["tweets", "posts"],
      });
    }
  }, [owner?.id, queryClient]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <>
      {postsLoading && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
      {!postsLoading &&
        tweets.map((t) => <TweetCard tweet={t} key={t.id} variant="default" />)}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
    </>
  );
}
