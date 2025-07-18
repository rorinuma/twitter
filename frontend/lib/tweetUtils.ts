import { RawTweet, Tweet } from "@/types/tweets.types";
import { RawUser, User } from "@/types/user.types";

export function normalizeUser(user: RawUser): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.display_name ?? undefined,
    bio: user.bio ?? undefined,
    avatarURL: user.avatar_url ?? undefined,
    bannerURL: user.banner_url ?? undefined,
    isVerified: user.is_verified,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    following: user.following ?? [],
    followers: user.followers ?? [],
  };
}

export function normalizeTweet(tweet: RawTweet): Tweet {
  return {
    id: tweet.id,
    userId: tweet.user_id,
    content: tweet.content ?? null,
    inReplyToTweetId: tweet.in_reply_to_tweet_id ?? null,
    originalTweetId: tweet.original_tweet_id ?? null,
    mediaURLs: tweet.media_urls ?? null,
    repliesCount: tweet.replies_count,
    likesCount: tweet.likes_count,
    retweetsCount: tweet.retweets_count,
    viewsCount: tweet.views_count,
    bookmarksCount: tweet.bookmarks_count,
    createdAt: tweet.created_at,
    updatedAt: tweet.updated_at,
    isLiked: tweet.is_liked,
    isRetweeted: tweet.is_retweeted,
    isViewed: tweet.is_viewed,
    isBookmarked: tweet.is_bookmarked,
    user: normalizeUser(tweet.user),
    replyTo: tweet.reply_to ? normalizeTweet(tweet.reply_to) : null,
    replies: tweet.replies ? tweet.replies.map(normalizeTweet) : null,
    thread: tweet.thread ? tweet.thread.map(normalizeTweet) : null,
    retweetedTweet: tweet.retweeted_tweet
      ? normalizeTweet(tweet.retweeted_tweet)
      : null,
    quotedTweet: tweet.quoted_tweet ? normalizeTweet(tweet.quoted_tweet) : null,
  };
}

export function normalizeTweets(tweets: RawTweet[]): Tweet[] {
  return tweets.map(normalizeTweet);
}

export const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
export const isImage = (url: string) =>
  /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(url);
