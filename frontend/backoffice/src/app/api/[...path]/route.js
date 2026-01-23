import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com';

// Handle ALL HTTP methods
export async function GET(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'GET', params);
}

export async function POST(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'POST', params);
}

export async function PUT(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'PUT', params);
}

export async function DELETE(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'DELETE', params);
}

export async function PATCH(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'PATCH', params);
}

async function proxyRequest(request, method, params) {
    try {
        // Build the backend URL
        const path = params?.path ? params.path.join('/') : '';
        const url = new URL(request.url);
        const backendUrl = `${BACKEND_URL}/api/${path}${url.search}`;

        // Get cookies from Next.js
        const cookieStore = await cookies();
        const authToken = cookieStore.get('authToken');

        // Get the original Content-Type
        const contentType = request.headers.get('content-type');
        const isMultipart = contentType && contentType.includes('multipart/form-data');

        // Prepare fetch options
        const fetchOptions = {
            method: method,
            headers: {},
        };

        // Add cookie if present
        if (authToken) {
            fetchOptions.headers['Cookie'] = `authToken=${authToken.value}`;
        }

        // Add body for POST, PUT, PATCH
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            if (isMultipart) {
                // For multipart, forward the body as-is (FormData)
                // Don't set Content-Type - let fetch/browser set it with boundary
                fetchOptions.body = await request.arrayBuffer();
                // Copy the Content-Type with boundary from the original request
                if (contentType) {
                    fetchOptions.headers['Content-Type'] = contentType;
                }
            } else {
                // For JSON requests
                fetchOptions.headers['Content-Type'] = 'application/json';
                try {
                    const body = await request.json();
                    fetchOptions.body = JSON.stringify(body);
                } catch (e) {
                    // No body or invalid JSON
                }
            }
        }

        // Forward to backend
        const response = await fetch(backendUrl, fetchOptions);

        let data;
        const responseContentType = response.headers.get('content-type');

        // Handle 204 No Content responses (no body)
        if (response.status === 204) {
            return new Response(null, {
                status: 204,
                headers: response.headers,
            });
        }

        try {
            if (responseContentType && responseContentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                // Try to parse as JSON anyway, fallback to text
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {message: text};
                }
            }
        } catch (parseError) {
            console.error('[API Proxy] Failed to parse response:', parseError);
            data = {message: 'Invalid response from backend'};
        }

        // Create Next.js response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
        });

        // Forward cookies if any
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        return nextResponse;
    } catch (error) {
        console.error('[API Proxy] Error:', error);
        return NextResponse.json(
            {message: 'Erreur de communication avec le serveur', error: error.message},
            {status: 500}
        );
    }
}
