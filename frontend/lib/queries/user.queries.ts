import { RawUser } from "@/types/user.types";
import axios from "axios";
import { normalizeUser } from "../tweetUtils";
import api from "../axios";
import { RawTweet } from "@/types/tweets.types";

export const getUserByUsername = async (username: string) => {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const { data } = await axios.get<RawUser>(
      `${baseURL}/soft/user/${username}`,
    );
    return normalizeUser(data);
  } catch (err) {
    throw err;
  }
};

export const searchByDisplayName = async (displayName: string) => {
  try {
    const { data } = await api.get<{ users: RawUser[] }>(
      `/protected/user/search/${displayName}`,
    );
    return data.users;
  } catch (err) {
    throw err;
  }
};
