"use client";

import {useState} from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || "Une erreur est survenue");
            }
        } catch (err) {
            console.error("Erreur lors de la demande de réinitialisation:", err);
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                    <div className="mb-4">
                        <BackButton to="/auth/login" label="Retour à la connexion" autoHide={false}/>
                    </div>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Email envoyé ! 📧
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
                    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                        <div className="p-4 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm text-green-800">
                                Si l'adresse email existe dans notre système, un lien de réinitialisation a été envoyé.
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            Veuillez vérifier votre boîte de réception (et vos spams) et suivre les instructions pour
                            réinitialiser votre mot de passe.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/auth/login"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                ← Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="mb-4">
                    <BackButton to="/auth/login" label="Retour à la connexion" autoHide={false}/>
                </div>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Mot de passe oublié ?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
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
                                    placeholder="votre.email@example.com"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            ← Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
