"use client";

import TweetCard from "@/components/tweets";
import Spinner from "@/components/ui/decorations/Spinner";
import { useOwner } from "@/context/OwnerContext";
import { useTweets } from "@/hooks/useTweetFeed";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function ProfileReplies() {
  const owner = useOwner();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (owner?.id) {
      queryClient.invalidateQueries({
        queryKey: ["tweets", "replies"],
      });
    }
  }, [owner?.id, queryClient]);

  const {
    data,
    isLoading: repliesLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTweets("replies", !!owner, owner?.id);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <>
      {repliesLoading && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
      {!repliesLoading &&
        tweets.map((t) => <TweetCard tweet={t} key={t.id} variant="default" />)}
      {hasNextPage && (
        <div ref={ref} className="flex w-full justify-center mt-4">
          <Spinner />
        </div>
      )}
    </>
  );
}
