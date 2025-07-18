import { RawUser, User } from "@/types/user.types";
import axios from "axios";
import { normalizeUser } from "../tweetUtils";

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
