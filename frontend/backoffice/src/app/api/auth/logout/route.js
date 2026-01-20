import {NextResponse} from 'next/server';

export async function POST(request) {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

        // Get the cookie from the request
        const cookie = request.headers.get('cookie');

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie ? {Cookie: cookie} : {}),
            },
            credentials: 'include',
        });

        const data = await response.json();

        // Create a Next.js response
        const nextResponse = NextResponse.json(data, {status: response.status});

        // Forward all Set-Cookie headers from the backend (to delete the cookie)
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        return nextResponse;
    } catch (error) {
        console.error('Logout proxy error:', error);
        return NextResponse.json(
            {message: 'Internal server error'},
            {status: 500}
        );
    }
}
