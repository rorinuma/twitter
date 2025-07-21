"use client";

import MainLoading from "@/components/ui/decorations/MainLoading";
import api from "@/lib/axios";
import { normalizeUser } from "@/lib/tweetUtils";
import { RawUser, User } from "@/types/user.types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.post<RawUser>("/protected/me");
        setUser(normalizeUser(data));
        if (
          pathname === "/signin" ||
          pathname === "/signup" ||
          pathname === "/"
        ) {
          router.replace("/home");
        }
      } catch (error) {
        console.log("no user: ", error);
        if (
          pathname === "/home" ||
          pathname === "/following" ||
          pathname.startsWith("/compose/post")
        ) {
          router.push("/");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <MainLoading />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Auth context must be within AuthProvider");
  }
  return context;
};
