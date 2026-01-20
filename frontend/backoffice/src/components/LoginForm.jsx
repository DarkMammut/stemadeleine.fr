"use client";

import {useState} from "react";
import useLogin from "@/utils/auth/useLogin";
import {useRouter} from "next/navigation";
import BackButton from "@/components/ui/BackButton";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const {login, loading, error} = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result) {
            router.push("/dashboard");
        }
    };

    const handleDevLogin = async () => {
        const result = await login("admin@example.com", "admin");
        if (result) {
            router.push("/dashboard");
        }
    };

    const handleForgotPassword = () => {
        // TODO: Implémenter la logique de récupération de mot de passe
        // Placeholder pour future fonctionnalité (pas de console.log ici)
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="mb-4">
                    <BackButton to="/" label="Retour à l'accueil" autoHide={false}/>
                </div>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Connexion au backoffice
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm/6 font-bold text-gray-900"
                            >
                                Adresse email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-15">
                                <label
                                    htmlFor="password"
                                    className="block text-sm/6 font-bold text-gray-900"
                                >
                                    Mot de passe
                                </label>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 hover:text-gray-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 hover:text-gray-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? "Connexion..." : "Se connecter"}
                            </button>
                        </div>
                    </form>

                    {/* Bouton Dev Login - Visible uniquement en développement local */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleDevLogin}
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-indigo-600 shadow-xs ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Dev login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
