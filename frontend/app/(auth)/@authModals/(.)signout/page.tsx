"use client";

import BlueOverlay from "@/components/shared/overlays/BlueOverlay";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import api from "@/lib/axios";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaXTwitter } from "react-icons/fa6";

export default function SignOut() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = useMemo(() => {
    return pathname === "/signout";
  }, [pathname]);

  const clearCookies = async () => {
    try {
      const { data } = await api.delete("/protected/signout");
      setMessage(data.message);
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data ||
          "Failed to clear the cookie due to server error.";
        setMessage(message);
      } else {
        console.error("Non-Axios error when clearing a cookie :", err);
        setMessage("An unexpected error occurred while clearing the cookie.");
      }
    }
  };

  return (
    isOpen && (
      <>
        <BlueOverlay centered={true}>
          <div className="flex flex-col gap-2 p-5 bg-background rounded-2xl shadow-default w-[16vw]">
            <div className="mx-auto">
              <FaXTwitter className="size-8" />
            </div>
            <div className="font-bold text-lg">Log out of X?</div>
            <div className="text-muted font-light text-sm">
              You can always log back in at any time. If you just want to switch
              accounts, you can do that by adding an existing account.
            </div>
            <div>
              <button
                className="flex justify-center items-center w-full bg-foreground text-foreground-alt p-2 rounded-full hover:opacity-90 duration-(--hover-duration)"
                onClick={clearCookies}
              >
                Log out
              </button>
            </div>
            <div>
              <button
                className="flex justify-center items-center w-full bg-background border-border-muted border text-foreground rounded-full p-2 hover:opacity-90 duration-(--hover-duration)"
                onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        </BlueOverlay>
        {message &&
          createPortal(<ErrorOverlay error={message} />, document.body)}
      </>
    )
  );
}
