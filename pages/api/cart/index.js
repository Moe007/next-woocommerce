import axios from "axios"

const api = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/cocart/v2`,
	withCredentials: true,
})

export default async function handler(req, res) {
	const { cart_key } = req?.query ?? {}
	if (req.method === "GET") {
		try {
			const { data, status } = await api.get(`/cart?cart_key=${cart_key}`)
			res.status(status).json(data)
		} catch (error) {
			res.status(error.response?.status ?? 500).json(
				error.response?.data ?? error.message
			)
		}
	} else if (req.method === "POST") {
		try {
			const { id, quantity, variation } = req.body
			const { data, status } = await api.post(
				`/cart/add-item?cart_key=${cart_key}`,
				{
					id,
					quantity: quantity.toString(),
					variation: variation || {},
				}
			)
			res.status(status).json(data)
		} catch (error) {
			res.status(error.response?.status ?? 500).json(
				error.response?.data ?? error.message
			)
		}
	}
}
