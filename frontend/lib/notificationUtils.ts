import { Notification, NotificationRaw } from "@/types/notifications.types";
import { normalizeTweet, normalizeUser } from "./tweetUtils";

export const normalizeNotification = (
  notification: NotificationRaw,
): Notification => {
  return {
    id: notification.id,
    type: notification.type,
    createdAt: notification.created_at,
    isRead: notification.is_read,
    tweet: notification.tweet ? normalizeTweet(notification.tweet) : undefined,
    actor: normalizeUser(notification.actor),
  };
};

export const normalizeNotifications = (
  notifications: NotificationRaw[],
): Notification[] => {
  return notifications.map(normalizeNotification);
};
