import Cart from "@/components/cart"
import SearchBar from "@/components/searchBar"
import { useHeader } from "@/context/HeaderContext"
import { NextSeo } from "next-seo"
import Link from "next/link"
import { useEffect, useState } from "react"

const Header = ({ pageTitle }) => {
	const { headerData } = useHeader()

	const [siteTitle, setSiteTitle] = useState()
	const [siteDescription, setSiteDescription] = useState()
	const [favicon, setFavicon] = useState()

	useEffect(() => {
		if (headerData?.header) {
			const { siteTitle, siteDescription, favicon } = headerData.header

			setSiteTitle(siteTitle)
			setSiteDescription(siteDescription)
			setFavicon(favicon)
		}
	}, [headerData])

	return (
		<>
			<NextSeo
				title={pageTitle}
				additionalLinkTags={[
					{
						rel: "icon",
						type: "image/png",
						href: favicon,
					},
				]}
				description={siteDescription}
			/>
			<header className='bg-blue-800 text-white p-2 flex justify-between space-x-8'>
				<Link href='/'>
					{pageTitle === "Home" ? <h1>ShoeShop</h1> : <h6>ShoeShop</h6>}
				</Link>
				<div className='grow'>
					<SearchBar />
				</div>
				<div>
					<Cart />
				</div>
			</header>
		</>
	)
}

export default Header
