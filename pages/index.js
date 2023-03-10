import Head from "next/head"
import Image from "next/image"
import { Inter } from "@next/font/google"
import Layout from "@/components/layout"
import { getProducts, priceString } from "@/utils/product"
import ProductTile from "@/components/productTile"
import Link from "next/link"
import { getCategories } from "@/utils/category"
import { useEffect } from "react"
import { useHeader } from "@/context/HeaderContext"
import { getHeaderFooterData } from "@/utils/headerFooter"
import { SiteLinksSearchBoxJsonLd } from "next-seo"

const inter = Inter({ subsets: ["latin"] })

export default function Home({ products, headerFooter }) {
	const { setHeaderState } = useHeader()

	useEffect(() => {
		setHeaderState(headerFooter)
	}, [headerFooter, setHeaderState])
	return (
		<>
			<SiteLinksSearchBoxJsonLd
				url={process.env.NEXT_PUBLIC_HOME_URL}
				potentialActions={[
					{
						target: `${process.env.NEXT_PUBLIC_HOME_URL}/products/filter?term`,
						queryInput: "search_term_string",
					},
				]}
			/>
			<Layout>
				<h2 className='text-2xl font-bold text-center'>Products</h2>
				<ul className='flex flex-wrap space-x-2'>
					{products.map((product) => (
						<li key={product.id} className=''>
							<Link href={`product/${product.slug}`}>
								<ProductTile
									name={product.name}
									image={product.images[0]}
									price={priceString(product)}
								/>
							</Link>
						</li>
					))}
				</ul>
			</Layout>
		</>
	)
}

export const getStaticProps = async (ctx) => {
	const { products } = await getProducts({ status: "publish", stock_status: "instock" })

	const categories = await getCategories({
		per_page: 100,
		hide_empty: true,
		orderby: "name",
		order: "asc",
	})

	const headerFooter = await getHeaderFooterData()
	return {
		props: {
			products,
			headerFooter: { ...(headerFooter || {}), categories },
		},
		revalidate: 1,
	}
}
