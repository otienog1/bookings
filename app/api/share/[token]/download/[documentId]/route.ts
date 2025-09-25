import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string; documentId: string }> }
) {
    try {
        const { token, documentId } = await params;

        // Forward the download request to the backend
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/share/${token}/download/${documentId}`, {
            method: 'GET',
        });

        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

        // Check content type first to determine how to handle response
        const contentType = response.headers.get('Content-Type') || '';
        console.log('Backend Content-Type:', contentType);

        if (!response.ok) {
            console.log('Backend response not OK, trying to read error...');
            const errorText = await response.text();
            console.log('Backend error response:', errorText);
            const errorData = { error: errorText || 'Download failed' };
            return NextResponse.json(errorData, { status: response.status });
        }

        // Get the file content as array buffer to preserve binary data
        const fileBuffer = await response.arrayBuffer();
        console.log('File buffer size:', fileBuffer.byteLength);

        // If content type is JSON, this is likely an error response
        if (contentType.includes('application/json')) {
            const textContent = new TextDecoder().decode(fileBuffer);
            console.log('Backend returned JSON instead of file:', textContent);
            try {
                const parsed = JSON.parse(textContent);
                return NextResponse.json(
                    { error: parsed.error || 'Backend returned JSON instead of file' },
                    { status: 400 }
                );
            } catch (e) {
                return NextResponse.json(
                    { error: 'Backend returned invalid JSON response' },
                    { status: 500 }
                );
            }
        }

        // If file is suspiciously small, log the content as text to check for errors
        if (fileBuffer.byteLength < 1000) {
            const textContent = new TextDecoder().decode(fileBuffer);
            console.log('Small file content (might be error):', textContent);
        }

        // Get headers from backend response
        const responseContentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const contentDisposition = response.headers.get('Content-Disposition');
        const contentLength = response.headers.get('Content-Length');

        console.log('Content-Type:', responseContentType);
        console.log('Content-Disposition:', contentDisposition);
        console.log('Content-Length:', contentLength);

        // Create response headers
        const headers: Record<string, string> = {
            'Content-Type': responseContentType,
        };

        if (contentDisposition) {
            headers['Content-Disposition'] = contentDisposition;
        }

        if (contentLength) {
            headers['Content-Length'] = contentLength;
        }

        // Return the file content directly as array buffer
        return new NextResponse(fileBuffer, { headers });
    } catch (error) {
        console.error('Download API error:', error);
        return NextResponse.json(
            { error: 'Failed to process download request' },
            { status: 500 }
        );
    }
}