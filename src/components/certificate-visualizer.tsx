import React from 'react';
import { Certificate } from '@/types/certificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateDaysRemaining, getExpiryStatusColor, isCertificateExpired } from '@/lib/certificate-service';

interface CertificateVisualizerProps {
    certificate: Certificate;
}

export function CertificateVisualizer({ certificate }: CertificateVisualizerProps) {
    // Calculate certificate validity period in days
    const totalValidDays = calculateDaysRemaining(certificate.not_after) +
        Math.ceil((new Date(certificate.not_after).getTime() -
            new Date(certificate.not_before).getTime()) /
            (1000 * 60 * 60 * 24));

    const daysRemaining = calculateDaysRemaining(certificate.not_after);
    const daysUsed = totalValidDays - daysRemaining;

    // Calculate percentages for visualization
    const percentageUsed = Math.max(0, Math.min(100, (daysUsed / totalValidDays) * 100));
    // const percentageRemaining = 100 - percentageUsed; // Not used currently

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-md">Certificate Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 dark:bg-blue-600"
                            style={{ width: `${percentageUsed}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Issued</p>
                            <p>{new Date(certificate.not_before).toLocaleDateString()}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-gray-500 dark:text-gray-400">Expires</p>
                            <p className={getExpiryStatusColor(certificate.not_after)}>
                                {new Date(certificate.not_after).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm mt-4">
                        <div>
                            <p className="text-gray-500">Total Validity</p>
                            <p>{totalValidDays} days</p>
                        </div>

                        <div className="text-right">
                            <p className="text-gray-500">Remaining</p>
                            <p className={getExpiryStatusColor(certificate.not_after)}>
                                {isCertificateExpired(certificate.not_after) ? 'Expired' : `${daysRemaining} days`}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
