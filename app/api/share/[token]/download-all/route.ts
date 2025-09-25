import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // Forward the request to the backend
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/share/${token}/download-all`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
            return NextResponse.json(errorData, { status: response.status });
        }

        // Get the zip file as a blob
        const zipBlob = await response.blob();

        // Get the filename from the Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'documents.zip';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }

        // Return the zip file with proper headers
        return new NextResponse(zipBlob, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': zipBlob.size.toString(),
            },
        });
    } catch (error) {
        console.error('Download all API error:', error);
        return NextResponse.json(
            { error: 'Failed to download documents' },
            { status: 500 }
        );
    }
}