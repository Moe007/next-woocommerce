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

export const getCategories = async (options, getAll = false) => {
	const api = setUpApiCreds()
	let allCategories = []

	try {
		if (getAll) {
			options.per_page = 100
			options.page = 1
			let { data: categories } = await api.get("products/categories", options)
			allCategories = allCategories.concat(categories)
			while (categories.length > 0) {
				options.page++
				const { data } = await api.get("products/categories", options)
				categories = data
				allCategories = allCategories.concat(categories)
			}
		} else {
			const { data: categories } = await api.get("products/categories", options)
			allCategories = allCategories.concat(categories)
		}
		return allCategories
	} catch (error) {
		return error.message
	}
}
