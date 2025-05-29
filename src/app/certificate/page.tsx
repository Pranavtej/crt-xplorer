'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Certificate } from '@/types/certificate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CertificateDetails } from '@/components/certificate-details';
import { CertificateVisualizer } from '@/components/certificate-visualizer';
import { CertificateSecurityAssessment } from '@/components/certificate-security-assessment';
import { AlertCircle, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { getExpiryStatusColor, isCertificateExpired, isCertificateExpiringSoon } from '@/lib/certificate-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CertificateContent() {
    const searchParams = useSearchParams();
    const domain = searchParams.get('domain') || '';
    const router = useRouter();

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!domain) {
            router.push('/');
            return;
        }

        async function loadCertificate() {
            try {
                // First try to get from sessionStorage (from search page)
                const sessionCert = sessionStorage.getItem('selectedCertificate');
                if (sessionCert) {
                    setCertificate(JSON.parse(sessionCert));
                    setLoading(false);
                    return;
                }

                // Fetch from API if not in sessionStorage
                const res = await fetch(`/api/certificates/fetch?domain=${encodeURIComponent(domain)}`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch certificate: ${res.status}`);
                }

                const data = await res.json();
                setCertificate(data);
            } catch (err) {
                console.error('Error loading certificate:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        }

        loadCertificate();
    }, [domain, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <div className="mb-8">
                    <Link href="/" className="flex items-center text-sm hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to search
                    </Link>
                </div>

                <Alert variant="destructive" className="mb-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || 'Failed to load certificate data'}
                    </AlertDescription>
                </Alert>

                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    // Calculate certificate expiration status
    // const daysRemaining = calculateDaysRemaining(certificate.not_after);
    const isExpired = isCertificateExpired(certificate.not_after);
    const isExpiringSoon = isCertificateExpiringSoon(certificate.not_after);

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="mb-8">
                <Link href="/" className="flex items-center text-sm hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to search
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{certificate.domains[0]}</h1>
                    <div className="text-muted-foreground mb-3">
                        {certificate.domains.length > 1 && (
                            <span>+ {certificate.domains.length - 1} other domains</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getExpiryStatusColor(certificate.not_after)}`}>
                            {isExpired ? (
                                <><AlertCircle className="h-3 w-3 mr-1" /> Expired</>
                            ) : isExpiringSoon ? (
                                <><Clock className="h-3 w-3 mr-1" /> Expires soon</>
                            ) : (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                            )}
                        </Badge>

                        <Badge variant="outline">{certificate.issuer}</Badge>
                    </div>
                </div>

                <Button variant="outline" className="shrink-0" onClick={() => {
                    // Create a blob with the certificate data and trigger download
                    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${certificate.domains[0]}-certificate.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }}>
                    <Download className="h-4 w-4 mr-2" /> Download JSON
                </Button>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Validity Period</CardTitle>
                                <CardDescription>Certificate timeline and expiration status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CertificateVisualizer certificate={certificate} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Domain Coverage</CardTitle>
                                <CardDescription>Domains secured by this certificate</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {certificate.domains.map(domain => (
                                        <div key={domain} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {domain}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="details">
                    <CertificateDetails certificate={certificate} />
                </TabsContent>

                <TabsContent value="security">
                    <CertificateSecurityAssessment certificate={certificate} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function CertificateDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <CertificateContent />
        </Suspense>
    );
}
