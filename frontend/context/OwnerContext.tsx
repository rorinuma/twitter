import { createContext, useContext } from "react";
import { User } from "@/types/user.types";

export const OwnerContext = createContext<User | null>(null);

export const useOwner = () => {
  const context = useContext(OwnerContext);
  if (!context) {
    return console.error("OwnerContext must be within OwnerContext.Provider");
  }
  return context;
};
