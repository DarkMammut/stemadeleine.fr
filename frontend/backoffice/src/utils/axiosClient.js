"use client";

import axios from "axios";
import {useMemo} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/utils/auth/AuthContext";

export function useAxiosClient() {
    const router = useRouter();
    const {logout} = useAuth();

    const client = useMemo(() => {
        const instance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
            withCredentials: true, // Envoie automatiquement les cookies HTTPOnly
        });

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Appeler l'API logout pour supprimer le cookie côté serveur
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
