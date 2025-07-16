import { Tweet } from "@/types/tweets.types";
import BlueOverlay from "../shared/overlays/BlueOverlay";
import axios from "axios";
import { useDeleteTweet } from "@/hooks/useDeleteTweet";

interface Props {
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  tweet: Tweet;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export default function DeletePostOverlay({
  setIsVisible,
  setError,
  tweet,
}: Props) {
  const { mutate: deleteTweet } = useDeleteTweet([
    "foryou",
    "posts",
    "following",
    "liked",
    "replies",
  ]);
  const handlePostDelete = async () => {
    deleteTweet(tweet.id, {
      onSuccess: () => {
        setError("Tweet deleted successfully");
        setIsVisible(false);
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          console.error("Error occured while deleting a tweet: ", err);
          if (err.response?.data) {
            setError(err.response.data);
          } else {
            setError("Network error while trying to delete the tweet");
            console.error(
              "Network error while trying to delete the tweet",
              err,
            );
          }
          setIsVisible(false);
        } else {
          setError("Unknown error while trying to delete the tweet");
          console.error("Unknown error while trying to delete the tweet", err);
        }
      },
    });
  };

  return (
    <BlueOverlay centered={true}>
      <div className="flex flex-col gap-2 px-8 py-6 bg-background w-[300px] rounded-2xl z-50">
        <span className="text-xl font-bold">Delete Post?</span>
        <span className="text-muted text-sm break-words">
          This can’t be undone and it will be removed from your profile, the
          timeline of any accounts that follow you, and from search results.
        </span>
        <button
          className="bg-error font-bold text-foreground mt-2 p-3 rounded-full hover:opacity-90 duration-(--hover-duration) "
          onClick={handlePostDelete}
        >
          Delete
        </button>
        <button
          className="bg-background font-bold p-3 rounded-full hover:bg-nav-hover duration-(--hover-duration) border-border border"
          onClick={() => setIsVisible(false)}
        >
          Cancel
        </button>
      </div>
    </BlueOverlay>
  );
}
