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
            // Use relative URLs to go through Next.js rewrites
            // This ensures cookies work correctly (same domain)
            withCredentials: true,
        });

        // Log outgoing requests when explicit debug flag is set
        const shouldLogRequests = process.env.NEXT_PUBLIC_AXIOS_DEBUG === "true" || true; // Always log for debugging

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
