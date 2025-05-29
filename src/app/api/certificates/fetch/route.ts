import { NextRequest, NextResponse } from 'next/server';
import * as tls from 'tls';
import { Certificate, CertificateDetails } from '@/types/certificate';

export const runtime = 'nodejs'; // Using Node.js runtime for native module support

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
        const certificate = await fetchCertificate(domain);
        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Failed to fetch certificate' },
            { status: 500 }
        );
    }
}

interface CertOptions {
    port?: number;
    servername?: string;
    timeout?: number;
}

async function fetchCertificate(domain: string, options: CertOptions = {}): Promise<Certificate> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect(
            {
                host: domain,
                port: options.port || 443,
                servername: options.servername || domain,
                timeout: options.timeout || 10000, // 10 seconds timeout
                rejectUnauthorized: false, // Allow self-signed or invalid certificates
            },
            () => {
                try {
                    const cert = socket.getPeerCertificate(true);

                    if (!cert || Object.keys(cert).length === 0) {
                        socket.destroy();
                        return reject(new Error('No certificate provided by server'));
                    }

                    // Type assertion to our interface since we know the structure
                    const parsedCert = parseCertificate(cert as unknown as PeerCertificate);
                    socket.destroy();
                    resolve(parsedCert);
                } catch (error) {
                    socket.destroy();
                    reject(error);
                }
            }
        );

        socket.on('error', (error) => {
            socket.destroy();
            reject(error);
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timed out'));
        });
    });
}

// Helper function to sanitize certificate object and remove circular references
function sanitizeCertificateForJSON(obj: unknown, seenObjects = new WeakMap()): unknown {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    // Check for circular reference
    if (seenObjects.has(obj)) {
        // Return a placeholder for circular references
        return "[Circular Reference]";
    }

    // Mark this object as seen
    seenObjects.set(obj, true);

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeCertificateForJSON(item, seenObjects));
    }

    // Handle regular objects
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        // Skip the issuerCertificate property which causes circular references
        if (key === 'issuerCertificate') {
            // Instead of including the entire issuer certificate, include only essential information
            if (value && typeof value === 'object') {
                const issuerCert = value as Record<string, unknown>;
                sanitized.issuerSummary = {
                    subject: issuerCert.subject,
                    issuer: issuerCert.issuer,
                    valid_from: issuerCert.valid_from,
                    valid_to: issuerCert.valid_to,
                    fingerprint: issuerCert.fingerprint
                };
            }
            continue;
        }
        sanitized[key] = sanitizeCertificateForJSON(value, seenObjects);
    }

    return sanitized;
}

// Define interface for peer certificate structure from Node.js TLS
interface PeerCertificate {
    subject: {
        CN?: string;
        [key: string]: string | undefined;
    };
    issuer: {
        CN?: string;
        O?: string;
        OU?: string;
        [key: string]: string | undefined;
    };
    subjectaltname?: string;
    valid_from: string;
    valid_to: string;
    fingerprint: string;
    [key: string]: unknown;
}

function parseCertificate(cert: PeerCertificate): Certificate {
    // Get all DNS entries from the subject alt name
    let altDomains: string[] = [];
    if (cert.subjectaltname) {
        // Improved regex to better handle various SAN formats
        const dnsEntries = cert.subjectaltname.match(/DNS:[^,]+/g);
        if (dnsEntries) {
            altDomains = dnsEntries.map((entry: string) => entry.replace('DNS:', '').trim());
        }
    }

    // Start with common name and add all alternative domain names
    const domains = cert.subject.CN ? [cert.subject.CN] : [];
    domains.push(...altDomains);

    // Remove duplicates and empty values
    const uniqueDomains = [...new Set(domains)].filter(domain => domain && domain.trim().length > 0);

    // Create a sanitized copy of the certificate without circular references
    const sanitizedCert = sanitizeCertificateForJSON(cert) as CertificateDetails;

    return {
        domains: uniqueDomains,
        issuer: formatDistinguishedName(cert.issuer),
        not_before: new Date(cert.valid_from).toISOString(),
        not_after: new Date(cert.valid_to).toISOString(),
        cert_json: sanitizedCert,
        inserted_at: new Date().toISOString(),
    };
}

function formatDistinguishedName(dn: { CN?: string; O?: string; OU?: string;[key: string]: string | undefined }): string {
    const parts = [];

    if (dn.CN) parts.push(`CN=${dn.CN}`);
    if (dn.O) parts.push(`O=${dn.O}`);
    if (dn.OU) parts.push(`OU=${dn.OU}`);

    return parts.join(', ');
}
