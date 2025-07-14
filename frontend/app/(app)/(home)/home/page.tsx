"use client";

import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { useTweets } from "@/hooks/useTweetFeed";
import TweetCard from "@/components/tweets/index";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTweets("foryou", !!user);

  const { ref, inView } = useInView();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading)
    return (
      <div className="flex justify-center mt-8">
        <Spinner />
      </div>
    );

  return (
    <section className="flex flex-col grow shrink">
      {tweets?.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} variant="default" />
      ))}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center my-4">
          <Spinner />
        </div>
      )}
    </section>
  );
}
