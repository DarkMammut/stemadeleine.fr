"use client";

import {useState} from "react";
import useLogin from "@/utils/auth/useLogin";
import {useRouter} from "next/navigation";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login, loading, error} = useLogin();

    const handleLogin = async (values) => {
        const result = await login(values.email, values.password);
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

    const fields = [
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            placeholder: "Email",
            defaultValue: email,
        },
        {
            name: "password",
            label: "Mot de passe",
            type: "password",
            required: true,
            placeholder: "Mot de passe",
            defaultValue: password,
        },
    ];

    return (
        <div
            className="p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4"
            style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
            }}
        >
            <h2
                className="text-2xl font-bold text-center"
                style={{color: 'var(--color-primary)'}}
            >
                Connexion
            </h2>
            {error && (
                <p style={{color: 'var(--color-danger)'}}>{error}</p>
            )}
            <MyForm
                fields={fields}
                onSubmit={handleLogin}
                loading={loading}
                submitButtonLabel="Se connecter"
            />
            <Button type="button" variant="secondary" onClick={handleDevLogin} className="w-full mt-2">
                Dev login
            </Button>
        </div>
    );
}
