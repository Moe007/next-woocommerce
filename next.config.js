/** @type {import('next').NextConfig} */
const wpDomain = new URL(process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL).hostname

const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: [wpDomain],
	},
}

module.exports = nextConfig
