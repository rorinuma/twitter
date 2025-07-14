import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }
  return "Unknown error";
};

export const queryClient = new QueryClient();
