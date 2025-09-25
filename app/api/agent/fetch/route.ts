import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/environment';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
        }

        const backendUrl = config.getApiUrl('/agent/fetch');

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${errorData}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching agents:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}