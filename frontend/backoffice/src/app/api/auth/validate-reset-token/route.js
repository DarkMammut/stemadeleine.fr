import {NextResponse} from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com';

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                {valid: false},
                {status: 400}
            );
        }

        // Forward to backend
        const response = await fetch(`${BACKEND_URL}/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Validate reset token proxy error:', error);
        return NextResponse.json(
            {valid: false},
            {status: 500}
        );
    }
}
