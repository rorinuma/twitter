import { Notification, NotificationRaw } from "@/types/notifications.types";
import api from "../axios";
import { normalizeNotifications } from "../notificationUtils";
import axios from "axios";

export const getNotifications = async (): Promise<
  Notification[] | undefined
> => {
  try {
    const { data } = await api.get<{
      notifications: NotificationRaw[];
      message: string;
    }>("/protected/user/notifications");
    return normalizeNotifications(data.notifications);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("axios error getting notifications: ", err);
    } else {
      console.error("unknown error getting notifications: ", err);
    }
  }
};
