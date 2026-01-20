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
            // ✅ Use local API routes (Next.js proxies to backend)
            baseURL: '',
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
                    // ✅ Don't call logout API - just clear local state and redirect
                    // This prevents the infinite logout loop
                    logout();
                    router.push("/auth/login");
                }
                return Promise.reject(error);
            },
        );

        return instance;
    }, [router, logout]);
}
