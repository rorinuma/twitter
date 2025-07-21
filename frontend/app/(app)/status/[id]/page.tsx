"use client";

import { useParams } from "next/navigation";
import TweetCard from "@/components/tweets/index";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import Post from "@/components/post/Post";
import { useTweet } from "@/hooks/useTweet";

export default function Status() {
  const params = useParams<{ id: string }>();
  const { data: tweet, isLoading, error } = useTweet(params.id);

  if (isLoading) {
    return <TweetCard tweet={null} loading={isLoading} variant="status" />;
  }

  if (!isLoading && !tweet) {
    return (
      <div className="flex h-full items-center justify-center">Not Found</div>
    );
  }

  if (error) {
    return <ErrorOverlay error={error.message} />;
  }

  if (tweet && !isLoading) {
    return (
      <>
        <div className="flex flex-col w-full">
          {tweet.thread &&
            tweet.thread.length > 2 &&
            tweet.thread?.map((t, i, arr) => (
              <TweetCard
                key={t.id}
                tweet={t}
                variant={i === arr.length - 1 ? "status" : "default"}
                replyBar={i !== arr.length - 1}
              />
            ))}
          {tweet.thread && tweet.thread.length > 2 ? null : (
            <TweetCard tweet={tweet} variant="status" />
          )}
          <Post modal={false} replyTo={params.id} />
          {tweet.replies?.map((reply) => (
            <TweetCard key={reply.id} tweet={reply} variant="default" />
          ))}
        </div>
      </>
    );
  }
}
