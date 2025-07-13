"use client";

import Status from "@/app/(app)/status/[id]/page";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import Overlay from "@/components/shared/overlays/Overlay";
import TweetActions from "@/components/tweets/TweetActions";
import ClientPortal from "@/components/utility/ClientPortal";
import { useClickOutside } from "@/hooks/clickOutside";
import { useDisableBodyScroll } from "@/hooks/disableBodyScroll";
import { useTweet } from "@/hooks/useTweet";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function PhotoGallery() {
  const params = useParams<{ id: string; photoId: string }>();
  const imageRef = useRef<HTMLImageElement>(null);
  const tweetActionsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string>("");

  useClickOutside([imageRef, tweetActionsRef, statusRef], () => {
    router.back();
  });

  const { data: tweet, error: tweetError } = useTweet(params.id);

  const photoId = params.photoId;
  const mediaIndex = Number(photoId) - 1;
  const mediaURL = tweet?.mediaURLs?.[mediaIndex];

  useDisableBodyScroll();

  return (
    <>
      {tweet && mediaURL && (
        <ClientPortal>
          <Overlay position="fixed">
            <main className="flex h-dvh w-dvw ">
              <section className="flex flex-col w-4/5 ">
                <div className="flex items-center justify-center h-[93%]">
                  <Image
                    src={mediaURL}
                    alt="gallery-image"
                    width={1200}
                    height={900}
                    ref={imageRef}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
                <div
                  className="flex justify-center h-[7%]"
                  ref={tweetActionsRef}
                >
                  <TweetActions
                    id={tweet.id}
                    repliesCount={tweet.repliesCount}
                    retweetsCount={tweet.retweetsCount}
                    likesCount={tweet.likesCount}
                    bookmarksCount={tweet.bookmarksCount}
                    viewsCount={tweet.viewsCount}
                    variant="gallery"
                    setError={setError}
                  />
                </div>
              </section>
              <section className="flex w-1/5" ref={statusRef}>
                <Status />
              </section>
            </main>
          </Overlay>
        </ClientPortal>
      )}
      {(tweetError || error) && (
        <ErrorOverlay error={tweetError?.message || error} />
      )}
    </>
  );
}
