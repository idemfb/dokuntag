/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    // Next.js 16 App Router ile sadece app/ altında i18n çalışır, pages/ yoksa sorun olmaz
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.dokuntag.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [], // Hiçbir açık domain yok, sadece remotePatterns izinli
    unoptimized: false,
  },
  // experimental.appDir kaldırıldı, App Router default
};

export default nextConfig;
