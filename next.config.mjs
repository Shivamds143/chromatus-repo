/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/chromatus-pro",
        destination: "/contact#contact-form",
        permanent: false,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about-us/:path*",
        destination: "/about/:path*",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-us/:path*",
        destination: "/contact/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
