import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import GuestCutoff from "@/components/utility/GuestCutoff";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import axios from "axios";
import { useState } from "react";
import { createPortal } from "react-dom";
import { IoPersonAddOutline } from "react-icons/io5";

interface Props {
  user: User;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function FollowButton({
  user,
  currentUser,
  setCurrentUser,
}: Props) {
  const [message, setMessage] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const followed = currentUser?.following.some(
    (follow) => follow === user.username,
  );

  const handleFollow = async () => {
    if (!currentUser) {
      setIsModalVisible(true);
      return;
    }

    if (followed) {
      try {
        await api.post(`/protected/user/follow/${user.username}`);
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            followers: [...prev.followers, currentUser.username],
          };
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.response?.data ||
            "Failed to follow the user due to server error.";
          setMessage(message);
        } else {
          console.error("Non-Axios error when following the user:", err);
          setMessage("An unexpected error occurred while following the user.");
        }
      }
    }
    if (!followed) {
      try {
        await api.delete(`/protected/user/unfollow/${user.username}`);
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            followers: prev.followers.filter((f) => f !== currentUser.username),
          };
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.response?.data ||
            "Failed to unfollow the user due to server error.";
          setMessage(message);
        } else {
          console.error("Non-Axios error when unfollowing the user:", err);
          setMessage(
            "An unexpected error occurred while unfollowing the user.",
          );
        }
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-center h-fit py-2 px-3 bg-foreground text-foreground-alt rounded-full hover:opacity-90 duration-(--hover-duration)"
        onClick={handleFollow}
      >
        {followed ? "Unfollow" : "Follow"}
      </button>

      {isModalVisible &&
        createPortal(
          <GuestCutoff
            icon={<IoPersonAddOutline className="size-10 text-blue" />}
            mainText={`Follow ${user.displayName} to see what they share on X.`}
            secondaryText={"Sign up so you never miss their posts"}
            setIsVisible={setIsModalVisible}
          />,
          document.body,
        )}
      {message && createPortal(<ErrorOverlay error={message} />, document.body)}
    </>
  );
}
