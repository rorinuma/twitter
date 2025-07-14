"use client";

import { isImage, isVideo } from "@/lib/tweetUtils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type MediaGridProps = {
  media: string[];
  statusId: string;
};

export function MediaGrid({ media, statusId }: MediaGridProps) {
  const count = media.length;
  const router = useRouter();

  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count >= 3) return "grid-cols-2 grid-rows-2";
    return "";
  };

  const handleMediaClick = (
    e: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    e.stopPropagation();
    if (isVideo(media[index])) {
      return;
    }
    const photoNumber = index + 1;
    router.push(`/status/${statusId}/photo/${photoNumber}`);
  };

  return (
    <div
      className={`grid gap-1 ${getGridClass()} w-full max-h-[500px] overflow-hidden`}
    >
      {media.map((src, idx) => {
        const isFirstOfThree = count === 3 && idx === 0;
        const spanClass = isFirstOfThree ? "col-span-2 row-span-1" : "";
        const commonClass = `object-cover w-full h-full rounded-2xl ${spanClass} border border-border hover:cursor-pointer`;

        if (isVideo(src)) {
          return (
            <video
              key={idx}
              src={src}
              onClick={(e) => handleMediaClick(e, idx)}
              className={commonClass}
              muted
              playsInline
              preload="metadata"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          );
        }

        if (isImage(src)) {
          return (
            <Image
              key={idx}
              width={300}
              height={400}
              src={src}
              alt="post-image"
              onClick={(e) => handleMediaClick(e, idx)}
              className={commonClass}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
