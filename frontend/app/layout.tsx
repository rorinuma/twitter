"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { AuthProvider } from "@/context/authContext";
import QueryProvider from "@/context/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
  modals,
}: Readonly<{
  children: React.ReactNode;
  modals: React.ReactNode;
}>) {
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh relative flex w-dvw justify-center overflow-x-hidden`}
      >
        <AuthProvider>
          <QueryProvider>
            <div className="flex justify-center w-full h-full" key="children">
              {children}
            </div>
            <div key="modals">{modals}</div>
          </QueryProvider>
        </AuthProvider>
      </body>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </html>
  );
}
