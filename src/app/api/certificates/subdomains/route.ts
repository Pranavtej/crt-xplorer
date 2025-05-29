import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json(
            { message: 'Domain parameter is required' },
            { status: 400 }
        );
    }

    try {
        // Get base domain (e.g., extract 'example.com' from 'www.example.com')
        const baseDomain = extractBaseDomain(domain);

        // For now, we'll return a simple response
        // In a real implementation, you'd query your database or certificate transparency logs
        return NextResponse.json({
            baseDomain,
            subdomains: []
        });
    } catch (error) {
        console.error('Error fetching subdomains:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Failed to fetch subdomains' },
            { status: 500 }
        );
    }
}

// Helper function to extract the base domain from a hostname
function extractBaseDomain(hostname: string): string {
    // Remove protocol if present
    let domain = hostname.replace(/^(https?:\/\/)?(www\.)?/i, '');

    // Remove port number if present
    domain = domain.split(':')[0];

    // Get the base domain (typically last two parts)
    const parts = domain.split('.');

    if (parts.length <= 2) {
        return domain; // Already a base domain
    }

    // Handle special cases like co.uk, com.au, etc.
    const tld = parts.slice(-2).join('.');
    if (['co.uk', 'com.au', 'co.nz', 'co.za', 'org.uk', 'net.au'].includes(tld)) {
        // For special TLDs, take three parts
        return parts.slice(-3).join('.');
    }

    // Default case, take the last two parts
    return parts.slice(-2).join('.');
}