import axios from "axios";
import api from "../axios";
import { RawTweet, Tweet, TweetsType } from "@/types/tweets.types";
import { normalizeTweet, normalizeTweets } from "../tweetUtils";

export const fetchTweets = async (
  page: number,
  tweetsType: TweetsType,
): Promise<Tweet[]> => {
  try {
    const { data } = await api.get<RawTweet[]>(
      `/protected/tweets/${tweetsType}?page=${page}`,
    );
    return normalizeTweets(data);
  } catch (err) {
    console.error("Failed to fetch tweets: ", err);
    throw err;
  }
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
