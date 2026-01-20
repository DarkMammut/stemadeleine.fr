import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST() {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

        // Get the cookie to send to backend
        const cookieStore = cookies();
        const authToken = cookieStore.get('authToken');

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? {Cookie: `authToken=${authToken.value}`} : {}),
            },
        });

        const data = await response.json();

        // Delete the cookie locally
        cookieStore.delete('authToken');

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Logout proxy error:', error);
        return NextResponse.json(
            {message: 'Internal server error'},
            {status: 500}
        );
    }
}
