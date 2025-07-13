import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import SmallButton from "../ui/buttons/SmallButton";
import IconButton from "../ui/buttons/IconButton";

interface Props {
  media: File;
  index: number;
  handleImageDelete: (index: number) => void;
}

export default function PostMedia({ media, index, handleImageDelete }: Props) {
  const mediaURL = URL.createObjectURL(media);
  const isVideoFile = media.type.startsWith("video");
  const isImageFile = media.type.startsWith("image");

  return (
    <div className="flex relative min-w-1/2 grow shrink">
      {isVideoFile && (
        <video
          src={mediaURL}
          muted
          playsInline
          preload="metadata"
          className="rounded-2xl object-cover w-full h-full"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      )}
      {isImageFile && (
        <Image
          src={mediaURL}
          width={250}
          height={250}
          alt="post-image"
          className="flex flex-1 rounded-2xl object-cover"
        />
      )}
      {/*<div className="absolute top-1 left-1">
        <SmallButton bg="blurred" text="Edit" />
      </div> */}

      <div className="absolute top-1 right-1">
        <IconButton
          icon={<IoMdClose />}
          bg="blurred"
          onClick={() => handleImageDelete(index)}
        />
      </div>
    </div>
  );
}
