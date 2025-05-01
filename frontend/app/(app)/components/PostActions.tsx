"use client";

import clsx from "clsx";
import { FaGlobeAmericas } from "react-icons/fa";
import { ReplyPermission, ReplyPermissionType } from "./Post";
import { useRef, useState } from "react";
import { useClickOutside } from "@/app/utils/clickOutside";
import { useCloseOnInteraction } from "@/app/utils/modalClose";
import { IconContext } from "react-icons";
import { CiImageOn } from "react-icons/ci";
import { createPortal } from "react-dom";
import ErrorOverlay from "@/app/components/ErrorOverlay";

interface Props {
  replyTo?: number;
  modal: boolean;
  isPostDisabled: boolean;
  replyPermission: ReplyPermission;
  setReplyPermission: React.Dispatch<React.SetStateAction<ReplyPermission>>;
  files: FileList | null;
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
}

export default function PostActions({
  replyTo,
  modal,
  isPostDisabled,
  replyPermission,
  setReplyPermission,
  files,
  setFiles,
}: Props) {
  const [permissionsModalVisible, setPermissionsModalVisible] =
    useState<boolean>(false);
  const permissionsModalRef = useRef<HTMLDivElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  useCloseOnInteraction(
    permissionsModalVisible,
    () => {
      setPermissionsModalVisible(false);
    },
    {
      breakpoint: 499,
      moreThan: false,
      closeOnScroll: true,
      scrollThreshold: 50,
    },
  );

  useClickOutside(permissionsModalRef, () => {
    setPermissionsModalVisible(false);
  });

  const handleFileUploadClick = () => {
    imageUploadRef.current?.click();
  };

  const handleFileUploadChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const uploadedFiles = event.target.files;
    if (
      (files && files.length >= 4) ||
      (files && uploadedFiles && files.length + uploadedFiles.length >= 4)
    ) {
    }
  };

  return (
    <>
      <div
        className={clsx("flex flex-col text-blue ml-2 mr-4", {
          "ml-10": !modal,
        })}
      >
        {!replyTo && (
          <div className="relative mb-2 ml-2 ">
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-blue-hover py-0.5 px-2 rounded-full duration-(--hover-duration) w-fit font-bold text-sm"
              onClick={() => setPermissionsModalVisible((prev) => !prev)}
            >
              <div>
                <FaGlobeAmericas />
              </div>
              <div>Everyone can reply</div>
            </button>
            {permissionsModalVisible && (
              <div
                ref={permissionsModalRef}
                className="flex flex-col grow shrink absolute top-7 -left-16 shadow-default rounded-xl p-4 text-foreground z-40 bg-background max-w-80 "
              >
                <div>Who can reply?</div>
                <div className="text-muted break-words">
                  Choose who can reply to this post. Anyone mentioned can always
                  reply
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={clsx("pt-2 ", {
            "border-t border-t-border": !replyTo,
          })}
        >
          <div className={"flex items-center justify-between ml-2 mb-2"}>
            <div className="flex items-center">
              <IconContext.Provider value={{ className: "size-5" }}>
                <button
                  type="button"
                  className="flex items-center rounded-full p-2 hover:bg-blue-hover duration-(--hover-duration)"
                  onClick={handleFileUploadClick}
                >
                  <CiImageOn />
                </button>
                <input
                  type="file"
                  alt="file-upload"
                  multiple
                  className="hidden"
                  ref={imageUploadRef}
                  onChange={handleFileUploadChange}
                />
              </IconContext.Provider>
            </div>
            <button
              className="bg-foreground text-foreground-alt rounded-full py-2 px-4 disabled:opacity-50"
              disabled={isPostDisabled}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      {error && createPortal(<ErrorOverlay error={error} />, document.body)}
    </>
  );
}
