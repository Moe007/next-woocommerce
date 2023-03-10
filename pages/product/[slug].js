import Layout from "@/components/layout"
import {
	getProducts,
	prepProductData,
	getProductAttr,
	getAttrTerms,
	findVariation,
} from "@/utils/product"
import Image from "next/image"
import { useEffect, useState } from "react"
import DOMPurify from "isomorphic-dompurify"
import AddToCart from "@/components/cart/addToCart"
import { useHeader } from "@/context/HeaderContext"
import { getCategories } from "@/utils/category"
import { getHeaderFooterData } from "@/utils/headerFooter"
import { NextSeo, ProductJsonLd } from "next-seo"
import { useRouter } from "next/router"

const Product = ({ product, preparedData, selectedAttrs: attrs, headerFooter }) => {
	const { setHeaderState } = useHeader()

	useEffect(() => {
		setHeaderState(headerFooter)
	}, [headerFooter, setHeaderState])

	const [selectedAttrs, setSelectedAttrs] = useState(attrs)

	const [variation, setVariation] = useState(preparedData)

	const { id, name, price, description, gallery, attributes, type } = variation

	const getNewAttrs = (attr, option) => {
		const i = selectedAttrs.findIndex((selectedAttr) => selectedAttr.id === attr.id)
		const newAttrs = Object.assign([...selectedAttrs], {
			[i]: {
				...selectedAttrs[i],
				option: option,
			},
		})
		return newAttrs
	}

	const changeVariation = (attr, option) => {
		const newAttrs = getNewAttrs(attr, option)
		setSelectedAttrs(newAttrs)
	}

	const displayAttrImg = (attr, option) => {
		const { image } = product.variations.find((variation) =>
			variation.attributes.some(
				(attribute) =>
					attr.id === attribute.id &&
					option.toLowerCase() === attribute.option.toLowerCase()
			)
		)
		return <Image alt={image.alt} src={image.src} width={300} height={400} />
	}

	useEffect(() => {
		const preparedData = prepProductData(product, selectedAttrs)
		delete preparedData.selectedAttrs
		setVariation(preparedData)
	}, [product, selectedAttrs])

	const router = useRouter()

	if (router.isFallback) {
		return (
			<Layout pageTitle={"Loading"}>
				<div className='flex h-full items-center justify-center'>
					<p>Loading...</p>
				</div>
			</Layout>
		)
	}
	return (
		<Layout pageTitle={name}>
			<NextSeo
				description={description.replace(/<[^>]*>?/gm, "")}
				canonical={`${process.env.NEXT_PUBLIC_HOME_URL}/products/${product.slug}`}
				openGraph={{
					url: `${process.env.NEXT_PUBLIC_HOME_URL}/products/${product.slug}`,
					images: [
						{
							url: gallery[0]?.src || "/next.svg",
							width: 300,
							height: 400,
							alt: gallery[0]?.alt || `Featured image of ${name}`,
						},
					],
				}}
			/>
			<div className='flex flex-col items-center space-y-4 mt-4'>
				<h1 className='text-3xl font-bold'>{name}</h1>
				<ProductJsonLd
					productName={name}
					images={[gallery[0]?.src || "/next.svg"]}
					description={description.replace(/<[^>]*>?/gm, "")}
					offers={[
						{
							price: Number(price).toFixed(2),
							priceCurrency: "ZAR",
							availability: "https://schema.org/InStock",
						},
					]}
				/>
				<Image
					alt={gallery[0]?.alt || `Image of ${name}`}
					src={gallery[0]?.src || "/next.svg"}
					width={300}
					height={400}
				/>
				<p>Price: R{Number(price).toFixed(2)}</p>
				<AddToCart
					productId={id.toString()}
					variation={selectedAttrs.reduce(async (prev, cur) => {
						const termSlug = variation.attributes
							.find((attr) => cur.id === attr.id)
							.options.find((opt) => opt.name === cur.option)
						return {
							...prev,
							[`attribute_${cur.slug}`]: termSlug,
						}
					}, {})}
				/>
				{type === "variable"
					? attributes.map((attr) => (
							<div key={attr.id}>
								<h5>
									{attr.name}:{" "}
									<span>
										{
											selectedAttrs.find(
												(attribute) => attr.id === attribute.id
											).option
										}
									</span>
								</h5>
								<div className='space-x-2'>
									{attr.options.map((option, index) => {
										return findVariation(
											product,
											getNewAttrs(attr, option.name)
										) ? (
											<button
												key={index}
												className={`p-2 border-2 ${
													selectedAttrs.some(
														(attribute) =>
															attribute.id === attr.id &&
															attribute.option.toLowerCase() ===
																option.name.toLowerCase()
													)
														? "border-sky-600"
														: "border-black"
												}`}
												onClick={() =>
													changeVariation(attr, option.name)
												}
											>
												{attr.type === "image"
													? displayAttrImg(attr, option.name)
													: option.name}
											</button>
										) : (
											""
										)
									})}
								</div>
							</div>
					  ))
					: ""}
				<h4 className='font-semibold text-xl'>Description</h4>
				<div
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(description),
					}}
				/>
			</div>
		</Layout>
	)
}

export const getStaticPaths = async () => {
	const { products } = await getProducts({
		per_page: 100,
		status: "publish",
		_fields: ["slug"],
	})

	const paths = products.map((product) => {
		return {
			params: { slug: product.slug },
		}
	})

	return {
		paths,
		fallback: true,
	}
}

export const getStaticProps = async (ctx) => {
	const { slug } = ctx.params

	const { products } = await getProducts({ slug })
	const product = products[0]

	if (!product) {
		return {
			notFound: true,
		}
	}

	const categories = await getCategories({
		per_page: 100,
		hide_empty: true,
		orderby: "name",
		order: "asc",
	})

	const preparedData = prepProductData(product, product.default_attributes)
	const { selectedAttrs } = preparedData

	for await (let [index, attr] of product.attributes.entries()) {
		const { type, slug } = await getProductAttr(attr.id)
		let terms = await getAttrTerms(selectedAttrs[index].id)
		terms = terms.map((term) => {
			return { name: term.name, slug: term.slug }
		})

		// * Terms from getAttrTerms are not always in the correct order.

		const options = attr.options.map((opt) => terms.find((term) => term.name === opt))

		product.attributes[index] = {
			...attr,
			type: type || "button",
			options,
		}
		selectedAttrs[index] = {
			...selectedAttrs[index],
			slug: slug || attr.name.toLowerCase(),
		}
	}

	delete preparedData.selectedAttrs

	const headerFooter = await getHeaderFooterData()

	return {
		props: {
			product,
			preparedData,
			selectedAttrs,
			headerFooter: { ...(headerFooter || {}), categories },
		},
		revalidate: 1,
	}
}

export default Product
