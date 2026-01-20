import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST(request) {
    try {
        const body = await request.json();
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // If login successful, extract and set the cookie
        if (response.ok) {
            const setCookieHeader = response.headers.get('set-cookie');

            if (setCookieHeader) {
                // Parse the Set-Cookie header
                const cookieParts = setCookieHeader.split(';').map(part => part.trim());
                const [nameValue] = cookieParts;
                const [name, value] = nameValue.split('=');

                // Extract cookie attributes
                const maxAge = cookieParts.find(p => p.startsWith('Max-Age='))?.split('=')[1];
                const path = cookieParts.find(p => p.startsWith('Path='))?.split('=')[1] || '/';
                const httpOnly = cookieParts.some(p => p === 'HttpOnly');

                // Set the cookie using Next.js cookies API
                const cookieStore = cookies();
                cookieStore.set({
                    name,
                    value,
                    httpOnly,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path,
                    maxAge: maxAge ? parseInt(maxAge) : 86400,
                });
            }
        }

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Login proxy error:', error);
        return NextResponse.json(
            {message: 'Internal server error'},
            {status: 500}
        );
    }
}
