/** @type {import('next').NextConfig} */
const nextConfig = {
  //#17.5 security 함수 사용하기 위한 셋팅
  experimental: {
    taint: true,
  },
  //cache 로그 확인하기 위한 셋팅
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatars.githubusercontent.com',
      },
      {
        hostname: 'imagedelivery.net',
      },
    ],
  },
};

export default nextConfig;
