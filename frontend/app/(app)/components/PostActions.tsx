"use client";

import clsx from "clsx";
import { FaGlobeAmericas } from "react-icons/fa";
import { useRef, useState } from "react";
import { useClickOutside } from "@/app/hooks/clickOutside";
import { useCloseOnInteraction } from "@/app/hooks/modalClose";
import { IconContext } from "react-icons";
import { CiImageOn } from "react-icons/ci";
import { createPortal } from "react-dom";
import ErrorOverlay from "@/app/components/ErrorOverlay";
import { BsPersonCheckFill } from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";
import { GoMention } from "react-icons/go";
import { IoMdCheckmark } from "react-icons/io";
import { ReplyPermission, ReplyPermissionType } from "@/app/types/postTypes";

interface Props {
  replyTo?: number;
  modal: boolean;
  isPostDisabled: boolean;
  replyPermission: ReplyPermission;
  setReplyPermission: React.Dispatch<React.SetStateAction<ReplyPermission>>;
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
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
      (uploadedFiles && uploadedFiles?.length > 4) ||
      (files && files.length > 4) ||
      (files && uploadedFiles && files.length + uploadedFiles.length > 4)
    ) {
      setError("Please choose up to 4 photos, videos, or GIFs");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    setFiles((prev) => {
      const newFiles = Array.from(uploadedFiles || []);
      if (!prev) return newFiles;
      return [...prev, ...newFiles];
    });
  };

  let permissionText: string = "Everyone can reply";
  let permissionIcon: React.ReactNode = <FaGlobeAmericas />;
  if (replyPermission.type === ReplyPermissionType.Followed) {
    permissionText = "Accounts you follow can reply";
    permissionIcon = <BsPersonCheckFill />;
  }
  if (replyPermission.type === ReplyPermissionType.Verified) {
    permissionText = "Only Verified accounts can reply";
    permissionIcon = <MdOutlineVerified />;
  }
  if (replyPermission.type === ReplyPermissionType.Mentioned) {
    permissionText = "Only Accounts you mention can reply";
    permissionIcon = <GoMention />;
  }

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
              className="relative flex items-center gap-2 hover:bg-blue-hover py-0.5 px-3 rounded-full duration-(--hover-duration) w-fit font-bold text-sm"
              onClick={() => setPermissionsModalVisible((prev) => !prev)}
            >
              <div>{permissionIcon}</div>
              <div>{permissionText}</div>
            </button>
            {permissionsModalVisible && (
              <div className="max-xs:fixed max-xs:inset-0 max-xs:bg-blue-overlay ">
                <div
                  ref={permissionsModalRef}
                  className="flex flex-col grow shrink absolute top-7 left-0 shadow-default rounded-xl 
                  text-foreground z-40 bg-background max-w-80 
                  max-xs:fixed max-xs:bottom-0 max-xs:top-1/4 max-xs:max-w-full  "
                >
                  <div className="flex flex-col p-4">
                    <div>Who can reply?</div>
                    <div className="text-muted break-words">
                      Choose who can reply to this post. Anyone mentioned can
                      always reply
                    </div>
                  </div>
                  <IconContext.Provider value={{ className: "size-4" }}>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="flex justify-between items-center py-3 px-4 grow shrink hover:bg-nav-hover duration-(--hover-duration)"
                        onClick={() => {
                          setReplyPermission({
                            type: ReplyPermissionType.Everyone,
                          });
                          setPermissionsModalVisible(false);
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="text-foreground bg-blue p-3 rounded-full">
                            <FaGlobeAmericas />
                          </div>
                          <div>Everyone</div>
                        </div>
                        {/* if it's checked there's a checkmark to the right */}
                        {replyPermission.type ===
                          ReplyPermissionType.Everyone && (
                            <div className="text-blue">{<IoMdCheckmark />}</div>
                          )}
                      </button>
                      <button
                        type="button"
                        className="flex justify-between items-center py-3 px-4 grow shrink hover:bg-nav-hover duration-(--hover-duration)"
                        onClick={() => {
                          setReplyPermission({
                            type: ReplyPermissionType.Followed,
                          });
                          setPermissionsModalVisible(false);
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="text-foreground bg-blue p-3 rounded-full">
                            <BsPersonCheckFill />
                          </div>
                          <div>Accounts you follow</div>
                        </div>
                        {/* if it's checked there's a checkmark to the right */}
                        {replyPermission.type ===
                          ReplyPermissionType.Followed && (
                            <div className="text-blue">{<IoMdCheckmark />}</div>
                          )}
                      </button>
                      <button
                        type="button"
                        className="flex justify-between items-center py-3 px-4 grow shrink hover:bg-nav-hover duration-(--hover-duration)"
                        onClick={() => {
                          setReplyPermission({
                            type: ReplyPermissionType.Verified,
                          });
                          setPermissionsModalVisible(false);
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="text-foreground bg-blue p-3 rounded-full">
                            <MdOutlineVerified />
                          </div>{" "}
                          <div>Verified accounts</div>
                        </div>
                        {replyPermission.type ===
                          ReplyPermissionType.Verified && (
                            <div className="text-blue">{<IoMdCheckmark />}</div>
                          )}
                      </button>
                      <button
                        type="button"
                        className="flex justify-between items-center py-3 px-4 grow shrink hover:bg-nav-hover duration-(--hover-duration) mb-1 rounded-bl-xl rounded-br-xl"
                        onClick={() => {
                          setPermissionsModalVisible(false);
                          setReplyPermission({
                            type: ReplyPermissionType.Mentioned,
                            mentions: [],
                          });
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="text-foreground bg-blue p-3 rounded-full">
                            <GoMention />
                          </div>
                          <div>Only accounts you mention</div>
                        </div>
                        {/* if it's checked there's a checkmark to the right */}
                        {replyPermission.type ===
                          ReplyPermissionType.Mentioned && (
                            <div className="text-blue">{<IoMdCheckmark />}</div>
                          )}
                      </button>
                    </div>
                  </IconContext.Provider>
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
                  accept="image/*,video/*"
                  ref={imageUploadRef}
                  onChange={handleFileUploadChange}
                />
              </IconContext.Provider>
            </div>
            <button
              className="hidden xs:flex bg-foreground text-foreground-alt rounded-full py-2 px-4 disabled:opacity-50"
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
