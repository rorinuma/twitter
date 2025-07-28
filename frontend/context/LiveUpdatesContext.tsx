import { getNotificationsCount } from "@/lib/queries/notifications.queries";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type NotificationPayload = {
  message: string;
};

type LiveUpdatesContextType = {
  notificationCount: number;
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  newTweetEvent: boolean;
  socket: WebSocket | null;
  resetNewTweetEvent: () => void;
};

const LiveUpdatesContext = createContext<LiveUpdatesContextType | undefined>(
  undefined,
);

export const LiveUpdatesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<WebSocket | null>(null);

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [newTweetEvent, setNewTweetEvent] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "notification:new":
            setNotificationCount((prev) => prev + 1);
            break;

          case "tweet:new":
            setNewTweetEvent(true);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    socket.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const count = await getNotificationsCount();
        setNotificationCount(count);
      } catch (err) {
        console.error("getting notification count failed: ", err);
      }
    })();
  }, []);

  function resetNewTweetEvent() {
    setNewTweetEvent(false);
  }

  return (
    <LiveUpdatesContext.Provider
      value={{
        notificationCount,
        setNotificationCount,
        newTweetEvent,
        socket: socketRef.current,
        resetNewTweetEvent,
      }}
    >
      {children}
    </LiveUpdatesContext.Provider>
  );
};

export function useLiveUpdates() {
  const context = useContext(LiveUpdatesContext);
  if (!context) {
    throw new Error("useLiveUpdates must be used within a LiveUpdatesProvider");
  }
  return context;
}
