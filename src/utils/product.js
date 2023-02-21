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

export const findVariation = (product, selectedAttrs) => {
	const variation =
		selectedAttrs.length > 0
			? product.variations.filter((variation) =>
					selectedAttrs.every((slctAttr) =>
						variation.attributes.some(
							(attr) =>
								slctAttr.id === attr.id &&
								slctAttr.option.toLowerCase() ===
									attr.option.toLowerCase()
						)
					)
			  )[0]
			: product.variations[0]
	return variation
}

export const prepProductData = (product, selectedAttrs) => {
	let { id, name, price, description, attributes, type } = product
	let gallery = product.images

	if (type === "variable") {
		const variation = findVariation(product, selectedAttrs)

		const options = variation.attributes.map((attr) => attr.option)
		name = `${name} - (${options.join(", ")})`
		id = variation.id
		price = variation.price
		description = variation.description || product.description
		// When using a gallery for each variation
		// gallery = [variation.image, ...variation.woo_variation_gallery_images]
		gallery = [variation.image]
		selectedAttrs = variation.attributes
	}
	return { id, name, price, description, gallery, attributes, selectedAttrs, type }
}

export const getProductAttr = async (id) => {
	const api = setUpApiCreds()
	try {
		const { data: attribute } = await api.get(`products/attributes/${id}`)
		return attribute
	} catch (error) {
		return error
	}
}

export const getAttrTerms = async (id) => {
	const api = setUpApiCreds()
	try {
		const { data: terms } = await api.get(`products/attributes/${id}/terms`)
		return terms
	} catch (error) {
		return error
	}
}
