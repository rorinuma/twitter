"use client";

import { Notification, notificationMap } from "@/types/notifications.types";
import Avatar from "../ui/user/Avatar";
import defaultAvatar from "@/public/placeholder.jpg";
import { formatDateNotifications } from "@/lib/dates";
import {
  useFloating,
  offset,
  flip,
  shift,
  useHover,
  useRole,
  useInteractions,
  autoUpdate,
} from "@floating-ui/react";
import { useState } from "react";
import TweetHoverProfile from "../tweets/TweetHoverProfile";
import { useRouter } from "next/navigation";
interface Props {
  notification: Notification;
}

export default function NotificationCard({ notification }: Props) {
  const { type } = notification;
  const config = notificationMap[type];
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  if (!config) return null;

  const Icon = config.icon;

  const handleNotificationClick = () => {
    if (notification.tweet) {
      return router.push(`/status/${notification.tweet.id}`);
    }
    return router.push(`/${notification.actor.username}`);
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip(), shift()],
    placement: "bottom",
    strategy: "absolute",
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 250, close: 150 },
  });

  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  return (
    <>
      <article
        className="flex py-3 px-4 hover:bg-nav-hover duration-(--hover-duration) cursor-pointer border-b border-b-border"
        onClick={handleNotificationClick}
      >
        <div className="flex w-full justify-between">
          <div className="flex gap-2">
            <div>
              <Icon className={`size-6 ${config.color}`} />
            </div>
            <div className="flex flex-col gap-2">
              <div {...getReferenceProps()} ref={refs.setReference}>
                <Avatar
                  width={32}
                  height={32}
                  image={notification.actor?.avatarURL ?? defaultAvatar}
                />
              </div>
              <div className="flex gap-1">
                <span className="font-bold">
                  {notification.actor?.displayName}
                </span>
                <span>{config.text}</span>
              </div>
              {notification.tweet && (
                <div className="text-muted">{notification.tweet.content}</div>
              )}
            </div>
          </div>
          <div className="text-sm text-muted">
            {formatDateNotifications(notification.createdAt)}
          </div>
        </div>
      </article>
      <TweetHoverProfile
        user={notification.actor}
        variant={"default"}
        refs={{ setFloating: refs.setFloating }}
        getFloatingProps={getFloatingProps}
        floatingStyles={floatingStyles}
        open={open}
      />
    </>
  );
}
