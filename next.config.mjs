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
    ];
  },
};

export default nextConfig;
