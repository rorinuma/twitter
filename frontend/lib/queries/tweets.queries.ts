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
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const { data } = await axios.get<{ tweet: RawTweet; message: string }>(
      `${baseURL}/status/${id}`,
    );
    console.log(data);
    return normalizeTweet(data.tweet);
  } catch (err) {
    console.error("Failed to fetch tweets: ", err);
    throw err;
  }
};
