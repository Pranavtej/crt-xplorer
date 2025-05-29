import { Certificate } from '@/types/certificate';

interface FetchCertificateResponse {
    success: boolean;
    certificate?: Certificate;
    error?: string;
}

export async function fetchCertificateFromDomain(domain: string): Promise<FetchCertificateResponse> {
    try {
        // Make API call to our backend to retrieve certificate information
        const res = await fetch(`/api/certificates/fetch?domain=${encodeURIComponent(domain)}`);

        if (!res.ok) {
            const errorData = await res.json();
            return {
                success: false,
                error: errorData.message || `Failed to fetch certificate: ${res.status}`
            };
        }

        const data = await res.json();
        return {
            success: true,
            certificate: data
        };
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export function formatCertificateSubject(subject: Record<string, string>): string {
    const parts = [];

    if (subject.CN) parts.push(`CN=${subject.CN}`);
    if (subject.O) parts.push(`O=${subject.O}`);
    if (subject.OU) parts.push(`OU=${subject.OU}`);
    if (subject.L) parts.push(`L=${subject.L}`);
    if (subject.ST) parts.push(`ST=${subject.ST}`);
    if (subject.C) parts.push(`C=${subject.C}`);

    return parts.join(', ');
}

export function calculateDaysRemaining(notAfter: string): number {
    const expiryDate = new Date(notAfter);
    const now = new Date();

    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

export function isCertificateExpired(notAfter: string): boolean {
    return calculateDaysRemaining(notAfter) <= 0;
}

export function isCertificateExpiringSoon(notAfter: string): boolean {
    const daysRemaining = calculateDaysRemaining(notAfter);
    return daysRemaining > 0 && daysRemaining <= 30;
}

export function getExpiryStatusColor(notAfter: string): string {
    if (isCertificateExpired(notAfter)) {
        return 'text-red-600 ';
    }
    if (isCertificateExpiringSoon(notAfter)) {
        return 'text-amber-600';
    }
    return 'text-green-600';
}


export function getBadgeStatusColor(notAfter: string): string {
    if (isCertificateExpired(notAfter)) {
        return 'text-red-600 bg-red-100 dark:bg-red-600 dark:text-red-100';
    }
    if (isCertificateExpiringSoon(notAfter)) {
        return 'text-amber-600 bg-amber-100 dark:bg-amber-600 dark:text-amber-100';
    }
    return 'text-green-600 bg-green-100 dark:bg-green-600 dark:text-green-100';
}


export function renderCertificateStatus(cert: Certificate): any {
    return null;
}
