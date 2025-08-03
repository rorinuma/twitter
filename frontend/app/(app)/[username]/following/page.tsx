"use client";

import UserCard from "@/components/ui/user/UserCard";
import { useOwner } from "@/context/OwnerContext";

export default function FollowingPage() {
  const owner = useOwner();

  return (
    owner &&
    owner.following.map((u, i) => (
      <UserCard key={i} username={u} user={null} isSearch={false} />
    ))
  );
}
