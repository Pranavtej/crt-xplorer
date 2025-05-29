import React from 'react';
import { Certificate } from '@/types/certificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { calculateDaysRemaining, isCertificateExpired, isCertificateExpiringSoon } from '@/lib/certificate-service';

interface CertificateSecurityAssessmentProps {
    certificate: Certificate;
}

export function CertificateSecurityAssessment({ certificate }: CertificateSecurityAssessmentProps) {
    const certJson = certificate.cert_json || {};

    // Security checks
    const isExpired = isCertificateExpired(certificate.not_after);
    const isExpiringSoon = isCertificateExpiringSoon(certificate.not_after);

    // Check for algorithm strength
    const hasStrongAlgorithm = certJson.signatureAlgorithm &&
        !certJson.signatureAlgorithm.includes('SHA1') &&
        !certJson.signatureAlgorithm.includes('MD5');

    // Check for strong key
    const hasStrongKey = certJson.publicKey &&
        certJson.publicKey.bits &&
        certJson.publicKey.bits >= 2048;

    // Check for wildcard domain
    const hasWildcardDomain = certificate.domains.some(domain => domain.includes('*'));

    // Get overall security score (0-100)
    const getSecurityScore = () => {
        let score = 100;

        if (isExpired) score -= 60;
        else if (isExpiringSoon) score -= 20;

        if (!hasStrongAlgorithm) score -= 30;
        if (!hasStrongKey) score -= 30;
        if (hasWildcardDomain) score -= 10;

        return Math.max(0, Math.min(100, score));
    };

    const securityScore = getSecurityScore();

    const getScoreColor = () => {
        if (securityScore >= 80) return 'text-green-500 dark:text-green-400';
        if (securityScore >= 60) return 'text-amber-500 dark:text-amber-400';
        return 'text-red-500 dark:text-red-400';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Security Assessment</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span>Security Score:</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getScoreColor()}`}>{securityScore}/100</span>
                            {securityScore >= 80 ? (
                                <ShieldCheck className={`h-5 w-5 ${getScoreColor()}`} />
                            ) : (
                                <ShieldAlert className={`h-5 w-5 ${getScoreColor()}`} />
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {!isExpired && !isExpiringSoon ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : isExpiringSoon ? (
                                    <Info className="h-4 w-4 text-amber-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>Valid Certificate Period</span>
                            </div>
                            <div className="text-sm">
                                {!isExpired && !isExpiringSoon ? (
                                    <span className="text-green-500">Valid for {calculateDaysRemaining(certificate.not_after)} days</span>
                                ) : isExpiringSoon ? (
                                    <span className="text-amber-500">Expiring soon ({calculateDaysRemaining(certificate.not_after)} days)</span>
                                ) : (
                                    <span className="text-red-500">Expired</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {hasStrongAlgorithm ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>Strong Algorithm</span>
                            </div>
                            <div className="text-sm">
                                {certJson.signatureAlgorithm || 'Unknown'}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {hasStrongKey ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>Strong Key Length</span>
                            </div>
                            <div className="text-sm">
                                {certJson.publicKey?.bits ? `${certJson.publicKey.bits} bits` : 'Unknown'}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {!hasWildcardDomain ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Info className="h-4 w-4 text-amber-500" />
                                )}
                                <span>Specific Domain Certificate</span>
                            </div>
                            <div className="text-sm">
                                {hasWildcardDomain ? 'Wildcard certificate' : 'Specific domains only'}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
