import React from 'react';
import { Certificate } from '@/types/certificate';
import { Shield, Calendar, Globe, Lock, Key, Hash } from 'lucide-react';

interface CertificateDetailsProps {
    certificate: Certificate;
}

export function CertificateDetails({ certificate }: CertificateDetailsProps) {
   
    const certJson = certificate.cert_json || {};
 
    const fingerprint = certJson.fingerprint || '';
    const fingerprint256 = certJson.fingerprint256 || '';

    return (
        <div className="grid gap-4">
            <div className="grid gap-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">Issuer:</span>
                    <span>{certificate.issuer}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">Valid From:</span>
                    <span>{new Date(certificate.not_before).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">Valid Until:</span>
                    <span className="">
                        {new Date(certificate.not_after).toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">Domain Count:</span>
                    <span>{certificate.domains.length} domain{certificate.domains.length !== 1 ? 's' : ''}</span>
                </div>

                {certJson.subjectaltname && (
                    <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-1" />
                        <span className="font-medium mt-1">Subject Alternative Names:</span>
                        <span className="break-all">{certJson.subjectaltname}</span>
                    </div>
                )}

                {fingerprint256 && (
                    <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-blue-500 mt-1" />
                        <span className="font-medium mt-1">SHA-256 Fingerprint:</span>
                        <span className="break-all font-mono text-xs">{fingerprint256}</span>
                    </div>
                )}

                {certJson.serialNumber && (
                    <div className="flex items-start gap-2">
                        <Key className="h-4 w-4 text-blue-500 mt-1" />
                        <span className="font-medium mt-1">Serial Number:</span>
                        <span className="break-all font-mono text-xs">{certJson.serialNumber}</span>
                    </div>
                )}

                {certJson.keyUsage && (
                    <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-blue-500 mt-1" />
                        <span className="font-medium mt-1">Key Usage:</span>
                        <span>{certJson.keyUsage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
