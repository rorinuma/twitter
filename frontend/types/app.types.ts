interface Tweet {
  id: string; // UUID
  userId: string; // UUID
  content: string | null;
  inReplyToTweetId: string | null; // UUID
  originalTweetId: string | null; // UUID
  mediaURLs: string[] | null;
  repliesCount: number;
  likesCount: number;
  retweetsCount: number;
  viewsCount: number;
  bookmarksCount: number;
  createdAt: Date | string; // Timestamp (can be string if ISO format)
  updatedAt: Date | string; // Timestamp (can be string if ISO format)
}
