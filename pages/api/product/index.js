import axios from "axios"
import { getProducts } from "@/utils/product"

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default

const api = new WooCommerceRestApi({
	url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
	consumerKey: process.env.WC_CONSUMER_KEY,
	consumerSecret: process.env.WC_CONSUMER_SECRET,
	queryStringAuth: true,
	version: "wc/v3",
})

export default async function handler(req, res) {
	let resData = {
		products: [],
	}

	const {
		per_page,
		search,
		extra_info,
		page,
		min_price,
		max_price,
		on_sale,
		category,
	} = req?.query ?? {}

	try {
		let fields =
			extra_info == "true"
				? [
						"id",
						"name",
						"slug",
						"images",
						"on_sale",
						"price",
						"regular_price",
						"sale_price",
				  ]
				: ["id", "name", "slug", "images"]
		const response = await getProducts({
			stock_status: "instock",
			status: "publish",
			search,
			per_page,
			page: page || 1,
			min_price,
			max_price,
			on_sale,
			category,
			_fields: fields,
		})

		const total = response.headers?.["x-wp-total"] || 0

		const pages = Math.ceil(total / (per_page || 20))

		resData = {
			...resData,
			products: response.products,
			pages,
		}

		res.status(200).json(resData)
	} catch (error) {
		res.status(error.response?.status ?? 500).json(
			error.response?.data ?? error.message
		)
	}
}
