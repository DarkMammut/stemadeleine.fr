"use client";

import { useState } from "react";
import { useAuth } from "@/utils/auth/AuthContext";
import { useAxiosClient } from "@/utils/axiosClient";
import { useRouter } from "next/navigation";

export default function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const axiosClient = useAxiosClient();
  const router = useRouter();

  const signout = async (redirect = true) => {
    setLoading(true);
    setError(null);

    try {
      await axiosClient.post("/api/auth/logout");

      // Met à jour le contexte local
      logout();

      setLoading(false);

      if (redirect) {
        router.push("/auth/login");
      }

      return true;
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
      setError(err.response?.data?.message || "Erreur lors de la déconnexion");
      setLoading(false);
      return false;
    }
  };

  return { signout, loading, error };
}
