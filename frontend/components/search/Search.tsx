"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { normalizeUser } from "@/lib/tweetUtils";
import { User } from "@/types/user.types";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import UserCard from "../ui/user/UserCard";
import { searchByDisplayName } from "@/lib/queries/user.queries";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

interface Props {
  explore?: boolean;
}

export default function Search({ explore }: Props) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const debouncedValue = useDebounce(searchValue, 500);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (debouncedValue.trim()) {
      (async () => {
        try {
          const rawUsers = await searchByDisplayName(debouncedValue);
          if (rawUsers) {
            setUsers(rawUsers.map(normalizeUser));
          }
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error("Axios error while performing the search: ", err);
          } else {
            console.error("Unknown error while performing the search: ", err);
          }
        }
      })();
    }
  }, [debouncedValue]);

  const displayedUsers = users.map((user, idx, arr) => (
    <UserCard
      key={user.id}
      lastRounded={idx + 1 === arr.length}
      user={user}
      isSearch={true}
    />
  ));

  const handleExploreClick = () => {
    if (!debouncedValue) {
      return;
    }
    router.push(`/explore?q=${debouncedValue}`);
  };

  return (
    (!pathname.startsWith("/explore") || explore) && (
      <form
        className={clsx("relative", {
          "w-full flex justify-center": explore,
        })}
      >
        <div className="relative">
          <input
            className={`${!explore && "w-3/5"} outline-1 outline-border rounded-full py-3 pl-8 pr-3 xs:pr-20 focus:outline-2 focus:outline-blue placeholder:text-foreground text-sm`}
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          />
          <IoSearchOutline className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          {isFocused && (
            <div
              className={`absolute top-full left-0 mt-2 ${explore && "w-full"} ${!explore && "w-3/5"} bg-background rounded-xl shadow-default flex flex-col`}
            >
              <span
                className="p-4 text-sm text-muted hover:bg-nav-hover duration-(--hover-duration) rounded-t-xl border-b border-b-border"
                onClick={handleExploreClick}
              >
                {debouncedValue
                  ? `Search for ${debouncedValue}`
                  : "Try searching for people, lists, or keywords"}
              </span>
              {displayedUsers}
            </div>
          )}
        </div>
      </form>
    )
  );
}
