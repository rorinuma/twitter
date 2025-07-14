"use client";

import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { useTweets } from "@/hooks/useTweetFeed";
import TweetCard from "@/components/tweets/index";

export default function Home() {
  const { user } = useAuth();
  const { data, isLoading } = useTweets("foryou", !!user);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];
  console.log(data);

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
