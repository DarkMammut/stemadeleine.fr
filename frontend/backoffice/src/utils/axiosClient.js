"use client";

import axios from "axios";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export function useAxiosClient() {
  const router = useRouter();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      withCredentials: true,
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          router.push("/auth/login");
        }
        return Promise.reject(error);
      },
    );

    return instance;
  }, [router]);

  return client;
}
