'use client';

import { useEffect, useState } from 'react';
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
import { getExpiryStatusColor, isCertificateExpired, isCertificateExpiringSoon, calculateDaysRemaining } from '@/lib/certificate-service';
import Link from 'next/link';

export default function CertificateDetailPage({ params }: { params: { domain: string } }) {
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        async function loadCertificate() {
            try {
                // First try to get from sessionStorage (from search page)
                const sessionCert = sessionStorage.getItem('selectedCertificate');
                if (sessionCert) {
                    setCertificate(JSON.parse(sessionCert));
                    setLoading(false);
                    return;
                }

                // Then try to find in localStorage
                const storedCertificates = localStorage.getItem('certificates');
                const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];

                const decodedDomain = decodeURIComponent(params.domain);
                const foundCert = certificates.find(cert =>
                    cert.domains.some(domain => domain === decodedDomain)
                );

                if (foundCert) {
                    setCertificate(foundCert);
                } else {
                    setError('Certificate not found in local storage');
                }
            } catch (err) {
                console.error('Error loading certificate:', err);
                setError('Failed to load certificate information');
            } finally {
                setLoading(false);
            }
        }

        loadCertificate();
    }, [params.domain]);

    const downloadCertificateJson = () => {
        if (!certificate) return;

        const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${certificate.domains[0]}-certificate.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderCertificateStatus = (cert: Certificate) => {
        if (isCertificateExpired(cert.not_after)) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Certificate Expired</AlertTitle>
                    <AlertDescription>
                        This certificate has expired and is no longer valid.
                    </AlertDescription>
                </Alert>
            );
        }

        if (isCertificateExpiringSoon(cert.not_after)) {
            return (
                <Alert variant="warning" className="mt-4 border-amber-500 text-amber-600">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Certificate Expiring Soon</AlertTitle>
                    <AlertDescription>
                        This certificate will expire in {calculateDaysRemaining(cert.not_after)} days.
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <Alert variant="default" className="mt-4 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Certificate Valid</AlertTitle>
                <AlertDescription className="text-green-600">
                    This certificate is valid for {calculateDaysRemaining(cert.not_after)} more days.
                </AlertDescription>
            </Alert>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="text-center">
                    <p className="text-lg">Loading certificate information...</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || 'Certificate not found'}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <Link href="/">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCertificateJson}
                >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                </Button>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl font-bold">
                                    {certificate.domains[0]}
                                </CardTitle>
                                <CardDescription>
                                    Certificate Information
                                </CardDescription>
                            </div>
                            <div>
                                <Badge className={getExpiryStatusColor(certificate.not_after)}>
                                    {isCertificateExpired(certificate.not_after) ? 'Expired' :
                                        isCertificateExpiringSoon(certificate.not_after) ? 'Expiring Soon' : 'Valid'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    {renderCertificateStatus(certificate)}

                    <CardContent className="pt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-4 mb-6">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <CertificateDetails certificate={certificate} />
                            </TabsContent>

                            <TabsContent value="security">
                                <CertificateSecurityAssessment certificate={certificate} />
                            </TabsContent>

                            <TabsContent value="timeline">
                                <CertificateVisualizer certificate={certificate} />
                            </TabsContent>

                            <TabsContent value="details">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Certificate Details</h3>
                                    <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                        <pre className="text-xs whitespace-pre-wrap">
                                            {JSON.stringify(certificate.cert_json, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
