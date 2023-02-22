const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default

const api = new WooCommerceRestApi({
	url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
	consumerKey: process.env.WC_CONSUMER_KEY,
	consumerSecret: process.env.WC_CONSUMER_SECRET,
	queryStringAuth: true,
	version: "wc/v3",
})

export default async function handler(req, res) {
	try {
		const { data, status } = await api.get(`orders/${req.query.id}`)
		res.status(status).json(data)
	} catch (error) {
		res.json(error)
	}
}
