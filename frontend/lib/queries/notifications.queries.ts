import { Notification, NotificationRaw } from "@/types/notifications.types";
import api from "../axios";
import { normalizeNotifications } from "../notificationUtils";
import axios from "axios";

export const getNotifications = async (): Promise<
  Notification[] | undefined
> => {
  try {
    const { data } = await api.get<{
      notifications: NotificationRaw[] | undefined;
      message: string;
    }>("/protected/user/notifications");
    if (data.notifications) {
      return normalizeNotifications(data.notifications);
    } else {
      return undefined;
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("axios error getting notifications: ", err);
    } else {
      console.error("unknown error getting notifications: ", err);
    }
  }
};

export const readNotification = async (id: string) => {
  try {
    await api.put(`/protected/user/notifications/read/${id}`);
  } catch (err) {
    throw err;
  }
};

export const getNotificationsCount = async () => {
  try {
    const { data } = await api.get<{ count: number; message: string }>(
      "/protected/user/notifications/count",
    );
    return data.count;
  } catch (err) {
    throw err;
  }
};
