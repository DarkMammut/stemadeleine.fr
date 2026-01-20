import {NextResponse} from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com';

export async function GET(request) {
    try {
        // Forward to backend avec les cookies
        const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Auth check proxy error:', error);
        return NextResponse.json(
            {authenticated: false},
            {status: 401}
        );
    }
}
