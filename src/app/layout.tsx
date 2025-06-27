import "./global.css";
import { Providers } from "../components/providers";
import StructuredData from "../components/structured-data";

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Drive Clone - Secure Cloud Storage & File Sharing",
  description:
    "Store, organize, and share your files securely in the cloud. Access your documents from anywhere with 10GB free storage. Enterprise-grade security included.",
  keywords: [
    "cloud storage",
    "file sharing",
    "secure storage",
    "online backup",
    "document management",
  ],
  authors: [{ name: "Drive Clone" }],
  openGraph: {
    title: "Drive Clone - Secure Cloud Storage & File Sharing",
    description:
      "Store, organize, and share your files securely in the cloud. Access your documents from anywhere with 10GB free storage.",
    type: "website",
    locale: "en_US",
    siteName: "Drive Clone",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drive Clone - Secure Cloud Storage & File Sharing",
    description:
      "Store, organize, and share your files securely in the cloud. Access your documents from anywhere with 10GB free storage.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <StructuredData />
          {children}
        </Providers>
      </body>
    </html>
  );
}
