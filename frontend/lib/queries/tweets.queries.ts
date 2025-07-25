import api from "../axios";
import { RawTweet, Tweet, TweetsType } from "@/types/tweets.types";
import { normalizeTweet } from "../tweetUtils";

const LIMIT = 10;

export const fetchTweets = async ({
  pageParam = 1,
  tweetsType: initial,
  ownerId,
}: {
  pageParam?: number;
  tweetsType: TweetsType;
  ownerId?: string;
}) => {
  const tweetsType = initial === "explore" ? "posts" : initial;
  const accessLevel =
    ownerId && tweetsType !== "liked" && initial !== "explore"
      ? "soft"
      : "protected";

  const { data } = await api.get<{ tweets: RawTweet[]; hasMore: boolean }>(
    `/${accessLevel}/tweets/${tweetsType}?page=${pageParam}&limit=${LIMIT}${ownerId ? `&ownerID=${ownerId}` : ""}`,
  );
  return {
    tweets: data.tweets.map(normalizeTweet),
    nextPage: data.hasMore ? pageParam + 1 : undefined,
  };
};

export const fetchTweet = async (
  id: string | null,
): Promise<Tweet | undefined> => {
  if (id == null) {
    console.log("wtf are you doing");
    return;
  }
  try {
    const { data } = await api.get<{ tweet: RawTweet; message: string }>(
      `/soft/status/${id}`,
    );
    return normalizeTweet(data.tweet);
  } catch (err) {
    console.error("Failed to fetch tweets: ", err);
    throw err;
  }
};

export const createTweet = async ({
  text,
  files,
  quoteTo,
  replyTo,
  mentionedUsers,
  replyPermission,
}: {
  text?: string;
  files?: File[] | null;
  quoteTo?: string | null;
  replyTo?: string;
  mentionedUsers?: string[];
  replyPermission: string;
}) => {
  const formData = new FormData();
  const params = new URLSearchParams();

  if (text) formData.append("text", text);
  if (files) files.forEach((file) => formData.append("files", file));
  if (quoteTo) params.append("quoteTo", quoteTo);
  if (replyTo) {
    formData.append("replyTo", replyTo);
    params.append("replyTo", replyTo);
  }
  if (mentionedUsers && mentionedUsers.length > 0) {
    mentionedUsers.forEach((user) => formData.append("mentionedUsers", user));
  }
  formData.append("replyPermission", replyPermission);

  const { data } = await api.post<RawTweet>(
    `/protected/tweets/create?${params.toString()}`,
    formData,
  );

  return normalizeTweet(data);
};

export const deleteTweet = async (id: string) => {
  await api.delete(`/protected/tweets/delete/${id}`);
};

export const deleteRetweet = async (originalTweetId: string) => {
  const { data } = await api.delete<{
    message: string;
    originalTweetId: string;
    retweetsCount: number;
  }>(`/protected/tweets/delete-retweet/${originalTweetId}`);
  return {
    originalTweetId: data.originalTweetId,
    retweetsCount: data.retweetsCount,
  };
};

export const likeTweet = async (tweetId: string) => {
  await api.post(`/protected/tweets/like/${tweetId}`);
};

export const unlikeTweet = async (tweetId: string) => {
  await api.delete(`/protected/tweets/unlike/${tweetId}`);
};

export const addView = async (tweetId: string) => {
  try {
    await api.post(`/protected/tweets/view/${tweetId}`);
  } catch (err) {
    throw err;
  }
};

export const addBookmark = async (tweetId: string) => {
  await api.post(`/protected/tweets/bookmark/${tweetId}`);
};

export const deleteBookmark = async (tweetId: string) => {
  await api.delete(`/protected/tweets/delete-bookmark/${tweetId}`);
};

export const createRetweet = async (id: string): Promise<Tweet> => {
  const { data } = await api.post<RawTweet>(
    `/protected/tweets/create?retweetedTweetID=${id}`,
    {},
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return normalizeTweet(data);
};
