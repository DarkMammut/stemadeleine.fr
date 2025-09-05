"use client";

import {useState} from "react";
import {useAuth} from "@/utils/auth/AuthContext";
import {useAxiosClient} from "@/utils/axiosClient";

export default function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {loginSuccess} = useAuth();
    const axiosClient = useAxiosClient();

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post("/api/auth/login", {
                email,
                password,
            });

            loginSuccess(); // Juste marquer comme connecté dans le contexte
            setLoading(false);
            return true;
        } catch (err) {
            console.error("Erreur de connexion:", err);
            setError(err.response?.data?.message || "Email ou mot de passe incorrect");
            setLoading(false);
            return false;
        }
    };

    return {login, loading, error};
}
