import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Footer } from "@/components/footer";
import { sfPro } from "./fonts";

export const metadata: Metadata = {
  title: "CRT Explorer - SSL/TLS Certificate Inspection Tool",
  description: "A powerful tool to explore, analyze, and compare SSL/TLS certificates for websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sfPro.variable} ${sfPro.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16 dark:from-black dark:via-zinc-900 dark:to-zinc-800">
            <div className="mx-auto min-h-screen w-full pb-16">
              {children}
            </div>
            {/* <Footer /> */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
