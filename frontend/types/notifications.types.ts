export type NotificationRaw = {
  id: string;
  actor_id: string;
  type: "like" | "reply" | "follow" | "retweet" | "quote";
  tweet_id: string;
  created_at: string;
  is_read: boolean;
};

export type Notification = {
  id: string;
  actorId: string;
  type: "like" | "reply" | "follow" | "retweet" | "quote";
  tweetId?: string;
  createdAt: string;
  isRead: boolean;
};
