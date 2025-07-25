import { Notification, NotificationRaw } from "@/types/notifications.types";

export const normalizeNotification = (
  notification: NotificationRaw,
): Notification => {
  return {
    id: notification.id,
    actorId: notification.actor_id,
    type: notification.type,
    tweetId: notification.tweet_id,
    createdAt: notification.created_at,
    isRead: notification.is_read,
  };
};

export const normalizeNotifications = (
  notifications: NotificationRaw[],
): Notification[] => {
  return notifications.map(normalizeNotification);
};
