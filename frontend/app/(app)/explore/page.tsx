"use client";

import Search from "@/components/search/Search";
import TweetCard from "@/components/tweets";
import ArrowButton from "@/components/ui/buttons/ArrowButton";
import Spinner from "@/components/ui/decorations/Spinner";
import UserCard from "@/components/ui/user/UserCard";
import { useTweets } from "@/hooks/useTweetFeed";
import { searchByDisplayName } from "@/lib/queries/user.queries";
import { normalizeUser } from "@/lib/tweetUtils";
import { User } from "@/types/user.types";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function Explore() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [users, setUsers] = useState<User[] | null>([]);
  const queryClient = useQueryClient();

  const firstUser = users?.[0];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTweets(
    "explore",
    !!firstUser,
    firstUser?.id,
  );

  const { ref, inView } = useInView();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (q?.trim()) {
      (async () => {
        try {
          const rawUsers = await searchByDisplayName(q);
          setUsers(rawUsers.map(normalizeUser));
        } catch (err) {
          console.error("Users not found: ", err);
          setUsers([]);
        } finally {
          queryClient.invalidateQueries({ queryKey: ["tweets", "explore"] });
        }
      })();
    }
  }, [q]);

  const displayedUsers = users?.map((user) => (
    <UserCard user={user} key={user.id} isSearch={false} />
  ));

  return (
    <div className="flex flex-col">
      <div className="flex items-center sticky top-0 gap-1 p-1 h-[57px] backdrop-blur-md z-10 border-b border-b-border">
        <ArrowButton />
        <Search explore />
      </div>
      <div className="pb-2 border-b-border border-b">{displayedUsers}</div>
      <section className="flex flex-col grow shrink">
        {tweets?.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} variant="default" />
        ))}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center mt-4">
            <Spinner />
          </div>
        )}
      </section>
    </div>
  );
}
