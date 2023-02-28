import axios from "axios"

export const getHeaderFooterData = async () => {
	try {
		const {
			data: { data: headerData },
		} = await axios.get(
			`${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/rae/v1/header-footer?header_location_id=hcms-menu-header&footer_location_id=hcms-menu-footer`
		)
		return headerData
	} catch (error) {
		console.log("error", error)
		return error
	}
}
