"use client";

import clsx from "clsx";
import { FaGlobeAmericas } from "react-icons/fa";
import { ReplyPermission, ReplyPermissionType } from "./Post";
import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/app/utils/clickOutside";
import { useCloseOnInteraction } from "@/app/utils/modalClose";

interface Props {
  replyTo?: number;
  modal: boolean;
  replyPermission: ReplyPermission;
  setReplyPermission: React.Dispatch<React.SetStateAction<ReplyPermission>>;
}

export default function PostActions({
  replyTo,
  modal,
  replyPermission,
  setReplyPermission,
}: Props) {
  const [permissionsModalVisible, setPermissionsModalVisible] =
    useState<boolean>(false);
  const permissionsModalRef = useRef<HTMLDivElement>(null);

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

  return (
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
              className="flex flex-col grow-1 shrink-1 absolute top-7 -left-16 shadow-default rounded-xl p-4 text-foreground z-40 bg-background max-w-80 "
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
        className={clsx("pt-3 ", {
          "border-t border-t-border": !replyTo,
        })}
      >
        <div className="flex items-center ml-2 mb-2">fosdkfosp</div>
      </div>
    </div>
  );
}
