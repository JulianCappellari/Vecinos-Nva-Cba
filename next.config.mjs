/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NEXT_DIST_DIR || ".next",
    compiler: {
        styledComponents: true,
        
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com'
            }
        ]
    }
};

export default nextConfig;
