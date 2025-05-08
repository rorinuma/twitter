"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleButton() {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn")!,
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "sign_in_with",
        },
      );
    }
  }, []);

  const handleCredentialResponse = (response: any) => {
    console.log("Token:", response.credential);
  };

  return <div id="google-btn"></div>;
}
