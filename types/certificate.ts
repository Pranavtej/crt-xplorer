export interface Certificate {
  domains: string[];
  issuer: string;
  not_before: string;
  not_after: string;
  cert_json: CertificateDetails;
  inserted_at: string;
}

export interface CertificateDetails {
  subject: DistinguishedName;
  issuer: DistinguishedName;
  subjectaltname?: string;
  infoAccess?: any;
  modulus?: string;
  exponent?: string;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  fingerprint256?: string;
  ext_key_usage?: string[];
  serialNumber?: string;
  raw?: any;
  issuerSummary?: {
    subject: DistinguishedName;
    issuer: DistinguishedName;
    valid_from: string;
    valid_to: string;
    fingerprint: string;
  };
  // Other properties might be present but these are the common ones
  [key: string]: any;
}

export interface DistinguishedName {
  C?: string; // Country
  ST?: string; // State/Province
  L?: string; // Locality
  O?: string; // Organization
  OU?: string; // Organizational Unit
  CN?: string; // Common Name
  [key: string]: string | undefined;
}
