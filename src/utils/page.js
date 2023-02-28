import axios from "axios"

export const getPages = async (options) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/index.php/wp-json/wp/v2/pages`,
			{ params: options }
		)
		return data
	} catch (error) {
		return error
	}
}
