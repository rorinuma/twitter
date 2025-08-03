import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import GuestCutoff from "@/components/utility/GuestCutoff";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import axios from "axios";
import { useEffect, useState } from "react";
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
  const [followed, setFollowed] = useState<boolean>(false);

  useEffect(() => {
    setFollowed(!!currentUser?.following.includes(user.username));
  }, [currentUser, user.username]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser) {
      setIsModalVisible(true);
      return;
    }

    try {
      if (!followed) {
        await api.post(`/protected/user/follow/${user.username}`);
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            following: [...prev.following, user.username],
          };
        });
        setFollowed(true);
      } else {
        await api.delete(`/protected/user/unfollow/${user.username}`);
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            following: prev.following.filter((u) => u !== user.username),
          };
        });
        setFollowed(false);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data ||
          "Server error.";
        setMessage(msg);
      } else {
        console.error(err);
        setMessage("Unexpected error.");
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
