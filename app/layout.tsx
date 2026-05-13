import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://straustailor.com'),
  title: {
    default: 'Straus Tailor Shop — Tailoring & Alterations in Fargo, ND',
    template: '%s | Straus Tailor Shop',
  },
  description: 'Expert tailoring, alterations & repairs in Fargo, ND. Suits, dresses, hems, zippers, and more. Walk-ins welcome — no appointment needed. Call (701) 929-8262.',
  keywords: [
    'tailor Fargo ND', 'alterations Fargo', 'tailoring Fargo North Dakota',
    'suit alterations Fargo', 'dress alterations Fargo', 'hem pants Fargo',
    'clothing repair Fargo', 'wedding dress alterations Fargo',
    'Straus Tailor Shop', 'tailor shop Fargo',
  ],
  authors: [{ name: 'Straus Tailor Shop' }],
  creator: 'Straus Tailor Shop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://straustailor.com',
    siteName: 'Straus Tailor Shop',
    title: 'Straus Tailor Shop — Tailoring & Alterations in Fargo, ND',
    description: 'Expert tailoring, alterations & repairs in Fargo, ND. Suits, dresses, hems, zippers, and more. Walk-ins welcome — no appointment needed.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Straus Tailor Shop — Fargo, ND',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Straus Tailor Shop — Tailoring & Alterations in Fargo, ND',
    description: 'Expert tailoring, alterations & repairs in Fargo, ND. Walk-ins welcome. (701) 929-8262.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://straustailor.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Straus Tailor Shop',
  description: 'Expert tailoring, alterations and repairs in Fargo, ND. Walk-ins welcome.',
  url: 'https://straustailor.com',
  telephone: '+17019298262',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1326 25th St S Suite B',
    addressLocality: 'Fargo',
    addressRegion: 'ND',
    postalCode: '58103',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 46.8444,
    longitude: -96.8556,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '16:00' },
  ],
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Credit Card',
  sameAs: [],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${dancingScript.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
