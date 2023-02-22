import axios from "axios"

const api = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/cocart/v2`,
	withCredentials: true,
})

export default async function handler(req, res) {
	if (req.method === "POST") {
		try {
			const { cart_key } = req?.query ?? {}
			const { data, status } = await api.post(`cart/clear?cart_key=${cart_key}`)
			res.status(status).json(data)
		} catch (error) {
			res.status(error.response.status).json(error.response.data)
		}
	} else {
		res.end()
	}
}
