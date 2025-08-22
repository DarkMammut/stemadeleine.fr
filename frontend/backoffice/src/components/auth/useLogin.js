"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthContext";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginSuccess } = useAuth();

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true },
      );

      loginSuccess();
      setLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur inconnue");
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
}
