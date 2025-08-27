"use client";

import axios from "axios";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/auth/AuthContext";

export function useAxiosClient() {
  const router = useRouter();
  const { logout } = useAuth();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      withCredentials: true,
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          router.push("/auth/login");
        }
        return Promise.reject(error);
      },
    );

    return instance;
  }, [router, logout]);

  return client;
}
