"use client";

import TweetCard from "@/components/tweets";
import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { useOwner } from "@/context/OwnerContext";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useTweets } from "@/hooks/useTweetFeed";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function ProfileReplies() {
  const owner = useOwner();
  const { user } = useAuth();
  const safeBack = useSafeBack(`/${owner?.username}`);

  if (owner?.id !== user?.id) {
    safeBack();
  }

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
