import axios from "axios"

const api = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/cocart/v2`,
	withCredentials: true,
})

export default async function handler(req, res) {
	const { cart_key } = req?.query ?? {}

	if (req.method === "POST") {
		try {
			const { itemKey } = req?.query ?? {}
			const { data, status } = await api.post(
				`/cart/item/${itemKey}?cart_key=${cart_key}`,
				req.body
			)
			res.status(status).json(data)
		} catch (error) {
			res.status(error.response?.status ?? 500).json(
				error.response?.data ?? error.message
			)
		}
	} else if (req.method === "DELETE") {
		try {
			const { itemKey } = req?.query ?? {}
			const { data, status } = await api.delete(
				`/cart/item/${itemKey}?cart_key=${cart_key}`
			)
			res.status(status).json(data)
		} catch (error) {
			res.status(error.response?.status ?? 500).json(
				error.response?.data ?? error.message
			)
		}
	} else {
		res.status(404).end()
	}
}
