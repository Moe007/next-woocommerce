const setUpApiCreds = () => {
	const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default

	const api = new WooCommerceRestApi({
		url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
		consumerKey: process.env.WC_CONSUMER_KEY,
		consumerSecret: process.env.WC_CONSUMER_SECRET,
		queryStringAuth: true,
		version: "wc/v3",
	})
	return api
}

export const getProducts = async (options, getAll = false) => {
	const api = setUpApiCreds()
	let resData = { products: [] }

	try {
		if (getAll) {
			options.per_page = 100
			options.page = 1
			let { data: products } = await api.get("products", options)
			resData.products = resData.products.concat(products)
			while (products.length > 0) {
				options.page++
				const { data } = await api.get("products", options)
				products = data
				resData.products = resData.products.concat(products)
			}
		} else {
			const { data: products, headers } = await api.get("products", options)
			resData.products = resData.products.concat(products)
			resData = { ...resData, headers }
		}

		for (const product of resData.products) {
			if (product.type === "variable") {
				const { data: variations } = await api.get(
					`products/${product.id}/variations`,
					{ per_page: 100 }
				)
				product.variations = variations
			}
		}
		return resData
	} catch (error) {
		return error.message
	}
}

export const priceString = (product) => {
	let price = `R${Number(product.price).toFixed(2)}`
	if (product.type === "variable") {
		const { variations } = product
		const minPrice = Math.min(...variations.map((variation) => variation.price))
		const maxPrice = Math.max(...variations.map((variation) => variation.price))

		price =
			minPrice === maxPrice
				? `R${minPrice.toFixed(2)}`
				: `R${minPrice.toFixed(2)}-R${maxPrice.toFixed(2)}`
	}
	return price
}
