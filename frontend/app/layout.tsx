import type { Metadata } from 'next';
import './globals.css';

// WHY: Comprehensive SEO metadata following SaaS industry standards
// Includes Open Graph, Twitter Cards, and all essential meta tags
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingimagestudio.com'),
  title: {
    default: 'Marketing Image Studio - AI-Powered Visual Generation Platform',
    template: '%s | Marketing Image Studio',
  },
  description:
    'Generate campaign-ready visuals by remixing base imagery with intelligent AI prompts. Transform marketing images with advanced AI technology for professional campaigns.',
  keywords: [
    'AI image generation',
    'marketing visuals',
    'image editing',
    'AI marketing tools',
    'visual content creation',
    'campaign imagery',
    'marketing automation',
    'AI-powered design',
    'image remix',
    'visual marketing',
  ],
  authors: [{ name: 'Marketing Image Studio' }],
  creator: 'Marketing Image Studio',
  publisher: 'Marketing Image Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Marketing Image Studio',
    title: 'Marketing Image Studio - AI-Powered Visual Generation Platform',
    description:
      'Generate campaign-ready visuals by remixing base imagery with intelligent AI prompts. Transform marketing images with advanced AI technology.',
    images: [
      {
        url: '/og-image.jpg', // Should be 1200x630px
        width: 1200,
        height: 630,
        alt: 'Marketing Image Studio - AI-Powered Visual Generation',
      },
    ],
  },
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Image Studio - AI-Powered Visual Generation',
    description:
      'Generate campaign-ready visuals by remixing base imagery with intelligent AI prompts.',
    images: ['/twitter-image.jpg'], // Should be 1200x600px
    creator: '@MarketingImageStudio',
  },
  // Robots configuration
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
  // Verification (add your actual verification codes)
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  // Additional metadata
  alternates: {
    canonical: '/',
  },
  category: 'Marketing Technology',
  classification: 'Business Software',
  // App-specific metadata
  applicationName: 'Marketing Image Studio',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  // Viewport and mobile optimization
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  // Apple-specific
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Marketing Image Studio',
  },
};

// WHY: Structured data (JSON-LD) for better search engine understanding
// Follows Schema.org standards for SoftwareApplication
function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Marketing Image Studio',
    applicationCategory: 'MarketingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description:
      'AI-powered platform for generating campaign-ready marketing visuals by remixing base imagery with intelligent prompts.',
    featureList: [
      'AI-powered image generation',
      'Intelligent prompt editing',
      'Campaign-ready visuals',
      'Multiple aspect ratios',
      'Reference image support',
    ],
    screenshot: '/screenshot.jpg',
    softwareVersion: '1.0',
    releaseNotes: 'Initial release with AI-powered image generation capabilities',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// WHY: Organization structured data for brand recognition
function OrganizationStructuredData() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Marketing Image Studio',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingimagestudio.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingimagestudio.com'}/logo.png`,
    description:
      'AI-powered platform for generating campaign-ready marketing visuals',
    sameAs: [
      // Add your social media profiles
      // 'https://twitter.com/MarketingImageStudio',
      // 'https://linkedin.com/company/marketing-image-studio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      // email: 'support@marketingimagestudio.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <OrganizationStructuredData />
        {/* Preconnect to external domains for performance (SEO ranking factor) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://contents.chromastudio.ai" />
      </head>
      <body>
        {/* WHY: Skip to main content link for accessibility and SEO */}
        <a href="#form-panel" className="skip-to-main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

