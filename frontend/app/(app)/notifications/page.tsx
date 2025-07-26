"use client";

import NotificationCard from "@/components/notifications/NotificationCard";
import { getNotifications } from "@/lib/queries/notifications.queries";
import { Notification } from "@/types/notifications.types";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    Notification[] | undefined
  >(undefined);

  useEffect(() => {
    const fetchNotifs = async () => {
      const notifications = await getNotifications();
      setNotifications(notifications);
    };
    fetchNotifs();
  }, []);

  const displayedNotifications = notifications?.map((notification) => (
    <NotificationCard key={notification.id} notification={notification} />
  ));

  useEffect(() => {
    console.log("notifications: ", notifications);
  }, [notifications]);

  return (
    <section className="relative flex flex-col">
      <header className="sticky top-0 p-2 flex items-center backface-visible h-14 xs:h-14 backdrop-blur-md z-10 border-b border-b-border">
        <span className="font-bold text-xl">Notifications</span>
      </header>
      {displayedNotifications}
    </section>
  );
}
