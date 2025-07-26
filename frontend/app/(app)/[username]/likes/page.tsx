"use client";

import TweetCard from "@/components/tweets";
import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { useOwner } from "@/context/OwnerContext";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useTweets } from "@/hooks/useTweetFeed";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function ProfileLikes() {
  const owner = useOwner();
  const { user } = useAuth();
  const safeBack = useSafeBack(`/${owner?.username}`);
  const queryClient = useQueryClient();

  if (owner?.id !== user?.id) {
    safeBack();
  }

  useEffect(() => {
    if (owner?.id) {
      queryClient.invalidateQueries({
        queryKey: ["tweets", "liked"],
      });
    }
  }, [owner?.id, queryClient]);

  const {
    data,
    isLoading: likedLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTweets("liked", owner?.id === user?.id, owner?.id);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <>
      {likedLoading && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
      {!likedLoading &&
        tweets.map((t) => <TweetCard tweet={t} key={t.id} variant="default" />)}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
    </>
  );
}
