import NotificationCard from "@/components/notifications/NotificationCard";
import { Notification } from "@/types/notifications.types";

export default function Notifications() {
  const notification: Notification = {
    id: "id",
    type: "retweet",
    createdAt: "22 Jul",
    isRead: false,
    actor: {
      id: "actorId",
      username: "actorUsername",
      displayName: "actorDisplayName",
      email: "balls@gmail.com",
      isVerified: false,
      createdAt: "Jul 22",
      updatedAt: "Jul 43",
      followers: [],
      following: [],
    },
  };

  return (
    <section className="relative flex flex-col">
      <header className="sticky top-0 p-2 flex items-center backface-visible h-14 xs:h-14 backdrop-blur-md z-10 border-b border-b-border">
        <span className="font-bold text-xl">Notifications</span>
      </header>
      <NotificationCard notification={notification} />
    </section>
  );
}
