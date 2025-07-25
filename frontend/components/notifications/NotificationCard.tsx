"use client";

import { useAuth } from "@/context/authContext";
import { Notification } from "@/types/notifications.types";
import { AiOutlineRetweet } from "react-icons/ai";
import Avatar from "../ui/user/Avatar";
import defaultAvatar from "@/public/placeholder.jpg";

interface Props {
  notification: Notification;
}

export default function NotificationCard({ notification }: Props) {
  const { user } = useAuth();

  return (
    <article className="flex py-3 px-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div>
            <AiOutlineRetweet className="size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <Avatar
              width={32}
              height={32}
              image={user?.avatarURL ?? defaultAvatar}
            />
            <div>{user?.displayName}</div>
          </div>
        </div>
        <div></div>
      </div>
    </article>
  );
}
