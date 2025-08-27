"use client";

import { useState } from "react";
import useLogin from "@/utils/auth/useLogin";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useLogin();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result) {
      router.push("/dashboard");
    }
  };

  const handleDevLogin = async () => {
    setUsername("admin@example.com");
    setPassword("admin");
    console.log("Dev login automatique");
    const result = await login("admin@example.com", "admin");
    if (result) {
      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="p-8 bg-white rounded-xl shadow-lg w-96 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-center">Connexion</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <button
        type="button"
        onClick={handleDevLogin}
        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
      >
        Dev login
      </button>
    </form>
  );
}
