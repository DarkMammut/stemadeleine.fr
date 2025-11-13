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

    // Log outgoing requests for debug (temporary)
    instance.interceptors.request.use((config) => {
      try {
        console.log("Axios request ->", {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          data: config.data,
        });
      } catch (e) {
        // ignore logging errors
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await instance.post("/api/auth/logout");
          } catch (logoutError) {
            console.warn("Erreur lors du logout automatique:", logoutError);
          }
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
