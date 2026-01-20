"use client";

import axios from "axios";
import {useMemo} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/utils/auth/AuthContext";

export function useAxiosClient() {
    const router = useRouter();
    const {logout} = useAuth();

    return useMemo(() => {
        const instance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com',
            withCredentials: true,
        });


        instance.interceptors.request.use((config) => {
            return config;
        });

        instance.interceptors.response.use(
            (response) => {
                return response;
            },
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
}
