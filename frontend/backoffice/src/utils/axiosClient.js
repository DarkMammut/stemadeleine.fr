"use client"; // nécessaire si tu utilises useRouter

import axios from "axios";
import { useRouter } from "next/navigation";

export function useAxiosClient() {
  const router = useRouter();

  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
      return Promise.reject(error);
    },
  );

  return client;
}
