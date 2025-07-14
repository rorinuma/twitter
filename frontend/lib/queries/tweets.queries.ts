import api from "../axios";
import { RawTweet, Tweet, TweetsType } from "@/types/tweets.types";
import { normalizeTweet } from "../tweetUtils";

export const fetchTweets = async ({
  pageParam = 1,
  tweetsType,
}: {
  pageParam?: number;
  tweetsType: TweetsType;
}) => {
  const { data } = await api.get<{ tweets: RawTweet[]; hasMore: boolean }>(
    `/protected/tweets/${tweetsType}?page=${pageParam}`,
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
