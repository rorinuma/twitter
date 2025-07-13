"use client";

import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { useTweets } from "@/hooks/useTweetFeed";
import TweetCard from "@/components/tweets/index";

export default function Home() {
  const { user } = useAuth();
  const { data: tweets, isLoading } = useTweets(0, "foryou", !!user);

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
    </section>
  );
}
