"use client";

import ResetPasswordForm from "@/components/ResetPasswordForm";
import {Suspense} from "react";

function ResetPasswordContent() {
    return <ResetPasswordForm/>;
}

export default function ResetPasswordPage() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Suspense fallback={
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            }>
                <ResetPasswordContent/>
            </Suspense>
        </div>
    );
}
