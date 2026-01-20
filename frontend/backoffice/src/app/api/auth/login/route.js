import {NextResponse} from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward to backend
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
        });

        // ✅ Forward Set-Cookie headers from backend
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        return nextResponse;
    } catch (error) {
        console.error('Login proxy error:', error);
        return NextResponse.json(
            {message: 'Erreur de connexion au serveur'},
            {status: 500}
        );
    }
}
