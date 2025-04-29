"use client"

import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext"


export default function Login() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/")
  }

  <div>

  </div>
}
