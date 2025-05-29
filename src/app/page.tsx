'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Certificate } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchCertificateFromDomain, calculateDaysRemaining, isCertificateExpired, isCertificateExpiringSoon, getBadgeStatusColor } from '@/lib/certificate-service';
import { AlertCircle, CheckCircle, Clock, Globe, ArrowRight, Download, Github } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateVisualizer } from '@/components/certificate-visualizer';
import { CertificateDetails } from '@/components/certificate-details';
import { CertificateSecurityAssessment } from '@/components/certificate-security-assessment';

export default function Home() {
  const [domain, setDomain] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [searchHistory, setSearchHistory] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load recent certificates from localStorage on component mount
  useEffect(() => {
    try {
      const storedCertificates = localStorage.getItem('certificates');
      const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];
      // Sort by inserted_at and take the 5 most recent
      const recentCerts = certificates
        .sort((a, b) => new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime())
        .slice(0, 5);
      setSearchHistory(recentCerts);
    } catch (err) {
      console.error("Failed to load recent certificates:", err);
    }
  }, []);

  const fetchCertificate = async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);

    try {
      const { success, certificate, error } = await fetchCertificateFromDomain(domain);

      if (success && certificate) {
        setCertificate(certificate);

        // Save to localStorage
        try {
          const storedCertificates = localStorage.getItem('certificates');
          const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];

          // Check if certificate already exists (by domain)
          const existingIndex = certificates.findIndex(cert =>
            cert.domains[0] === certificate.domains[0]
          );

          if (existingIndex !== -1) {
            // Update existing certificate
            certificates[existingIndex] = certificate;
          } else {
            // Add new certificate
            certificates.unshift(certificate);
          }

          // Keep only last 50 certificates to prevent localStorage from growing too large
          const limitedCertificates = certificates.slice(0, 50);
          localStorage.setItem('certificates', JSON.stringify(limitedCertificates));
        } catch (storageError) {
          console.error('Failed to save certificate to localStorage:', storageError);
        }

        // Add to search history if not already there
        setSearchHistory(prev => {
          const exists = prev.some(cert =>
            cert.domains[0] === certificate.domains[0]
          );

          if (!exists) {
            return [certificate, ...prev].slice(0, 10); // Keep last 10 searches
          }
          return prev;
        });
      } else {
        setError(error || 'Failed to fetch certificate');
        setCertificate(null);
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('An unexpected error occurred');
      setCertificate(null);
    } finally {
      setLoading(false);
      setDomain('');
    }
  };

  const renderCertificateStatus = (cert: Certificate) => {
    const daysRemaining = calculateDaysRemaining(cert.not_after);

    if (isCertificateExpired(cert.not_after)) {
      return (
        <Alert variant="destructive" className="mt-2">
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
        <Alert variant="warning" className="mt-2">
          <Clock className="h-4 w-4" />
          <AlertTitle>Certificate Expiring Soon</AlertTitle>
          <AlertDescription>
            This certificate will expire in {daysRemaining} days.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="default" className="mt-1 border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-700">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-600 dark:text-green-400">Certificate Valid</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-400">
          This certificate is valid for {daysRemaining} more days.
        </AlertDescription>
      </Alert>
    );
  };

  const downloadCertificateJson = (cert: Certificate) => {
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.domains[0]}-certificate.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <a
        href="https://github.com/Pranavtej/crt-xplorer"
        target="_blank"
        rel="noreferrer"
        className="mx-auto mb-5 flex max-w-fit animate-fade-up items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 px-7 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700"
        style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
      >
        <Github className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Star on GitHub
        </p>
      </a>
      <h1
        className="animate-fade-up bg-gradient-to-br from-black via-gray-700 to-stone-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-5xl md:leading-[5rem]"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        CERT Explorer
      </h1>
      <p
        className="mt-2 animate-fade-up text-center text-gray-500 dark:text-gray-400 opacity-0 [text-wrap:balance] md:text-xl"
        style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
      >
        Explore SSL/TLS certificates for any domain
      </p>
      <div className="flex justify-center items-center gap-2 mt-4 mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}>
        <Input
          placeholder="Enter domain name (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCertificate()}
          className="block w-full max-w-md rounded-md border-gray-200  text-sm text-gray-900 dark:text-white dark:border-zinc-700 placeholder-gray-400 shadow-lg focus:border-gray-500 focus:outline-none focus:ring-gray-500"

        />

        <Button
          size="icon"
          className="w-full max-w-md absolute  right-1 top-1 bottom-1 h-auto aspect-square bg-transparent ring-0 ring-transparent focus-visible:ring-0 shadow-none border-none focus:bg-transparent focus:ring-0 outline-none focus:border-none focus:shadow-none focus:outline-none hover:bg-transparent dark:hover:bg-transparent transition-all duration-200  active:ring-0 active:border-none active:shadow-none"
          variant="ghost"
          disabled={loading}
          onClick={fetchCertificate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {certificate && (
        <div className="space-y-6 animate-fade-up opacity-0" style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}>
          <Card className="backdrop-blur-sm bg-card/50 dark:bg-card/50 border border-border/50 shadow-xl dark:shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold ">
                    {certificate.domains[0]}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Certificate Information
                  </CardDescription>
                </div>
                <div className="flex gap-2 justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCertificateJson(certificate)}
                    className="hover:bg-accent/80 dark:hover:bg-accent/80 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Badge className={getBadgeStatusColor(certificate.not_after)}>
                    {isCertificateExpired(certificate.not_after) ? 'Expired' :
                      isCertificateExpiringSoon(certificate.not_after) ? 'Expiring Soon' : 'Valid'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <div className="flex pl-2 pr-2">
              {renderCertificateStatus(certificate)}
            </div>


            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="domains">Domains</TabsTrigger>
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
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(certificate.cert_json, null, 2)}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="domains">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Subject Alternative Names</h3>
                    <div className="grid gap-2">
                      {certificate.domains.map((domain, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span>{domain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {!certificate && !loading && !error && (
        <div className="text-center p-8 border border-dashed rounded-md dark:border-gray-700 animate-fade-up opacity-0" style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}>
          <Globe className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Certificate Information</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Enter a domain name above to fetch its SSL/TLS certificate information
          </p>
        </div>
      )}

      {searchHistory.length > 0 && !certificate && (
        <div className="mt-8 animate-fade-up opacity-0" style={{ animationDelay: "0.75s", animationFillMode: "forwards" }}>
          <h3 className="text-lg font-medium mb-4">Recent Searches</h3>
          <div className="grid gap-3">
            {searchHistory.map((cert, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle className="text-md flex justify-between">
                    <span>{cert.domains[0]}</span>
                    <Badge className={getBadgeStatusColor(cert.not_after)}>
                      {isCertificateExpired(cert.not_after) ? 'Expired' :
                        isCertificateExpiringSoon(cert.not_after) ? 'Expiring Soon' : 'Valid'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="py-2 bg-muted flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Issuer: {cert.issuer}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDomain(cert.domains[0]);
                        setCertificate(cert);
                      }}
                    >
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
