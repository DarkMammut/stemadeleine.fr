import {NextResponse} from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward to backend
        const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Forgot password proxy error:', error);
        return NextResponse.json(
            {message: 'Erreur de connexion au serveur'},
            {status: 500}
        );
    }
}
