import React from 'react';
import { Certificate } from '@/types/certificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getExpiryStatusColor, isCertificateExpired, isCertificateExpiringSoon } from '@/lib/certificate-service';

interface CertificateComparisonProps {
    certificates: Certificate[];
    onRemove: (index: number) => void;
}

export function CertificateComparison({ certificates, onRemove }: CertificateComparisonProps) {
    if (!certificates.length) {
        return null;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Certificate Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">Domain</th>
                                <th className="px-4 py-2 text-left">Issuer</th>
                                <th className="px-4 py-2 text-left">Valid From</th>
                                <th className="px-4 py-2 text-left">Valid Until</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map((cert, index) => (
                                <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="px-4 py-3">{cert.domains[0]}</td>
                                    <td className="px-4 py-3">{cert.issuer}</td>
                                    <td className="px-4 py-3">{new Date(cert.not_before).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{new Date(cert.not_after).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            {isCertificateExpired(cert.not_after) ? (
                                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                            ) : isCertificateExpiringSoon(cert.not_after) ? (
                                                <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                            )}
                                            <span className={getExpiryStatusColor(cert.not_after)}>
                                                {isCertificateExpired(cert.not_after) ? 'Expired' :
                                                    isCertificateExpiringSoon(cert.not_after) ? 'Expiring Soon' : 'Valid'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
