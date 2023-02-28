import useDebounce from "@/hooks/useDebounce"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import ProductTile from "@/components/productTile"
import Link from "next/link"
import Layout from "@/components/layout"
import Input from "@/components/form/input"
import { useHeader } from "@/context/HeaderContext"
import { getCategories } from "@/utils/category"
import { getHeaderFooterData } from "@/utils/headerFooter"
import { decode } from "html-entities"

const Filter = ({ headerFooter }) => {
	const { setHeaderState } = useHeader()
	const categories = [...headerFooter?.categories].sort((a, b) =>
		a.name.localeCompare(b.name)
	)

	useEffect(() => {
		setHeaderState(headerFooter)
	}, [headerFooter, setHeaderState])

	const router = useRouter()
	const [term, setTerm] = useState("")
	const [loading, setLoading] = useState(false)
	const [filteredProducts, setFilteredProducts] = useState([])
	const [filters, setFilters] = useState({
		category: [],
		min_price: 0,
		max_price: 100000,
		on_sale: false,
	})

	useDebounce(
		() => {
			setLoading(true)
			const search = async () => {
				const {
					data: { products, pages },
				} = await axios.get(`${process.env.NEXT_PUBLIC_HOME_URL}/api/product`, {
					params: {
						per_page: 20,
						search: term,
						extra_info: true,
						category: filters.category.join(),
						min_price: filters.min_price,
						max_price: filters.max_price,
						on_sale: filters.on_sale,
					},
				})
				setFilteredProducts(products || [])
				setLoading(false)
			}
			search()
			router.replace(
				{
					pathname: "/product/filter",
					query: {
						...router.query,
						term,
						category: filters.category.join(","),
						min_price: filters.min_price,
						max_price: filters.max_price,
						on_sale: filters.on_sale ? "true" : null,
					},
				},
				undefined,
				{
					shallow: true,
				}
			)
		},
		500,
		[term, filters]
	)

	useEffect(() => {
		setTerm(router.query?.term)
		setFilters({
			...filters,
			category: router.query?.category
				? router.query?.category.split(",").map(Number)
				: [],
			min_price: router.query?.min_price || 0,
			max_price: router.query?.max_price || 100000,
			on_sale: router.query?.on_sale === "true" ? true : false,
		})
	}, [router.isReady, router.query?.term])

	return (
		<Layout pageTitle='Filter'>
			{loading && <div>Searching...</div>}

			<section className='flex'>
				<div className='flex flex-col'>
					<h5>Filters</h5>
					<h6>Categories</h6>
					<ul>
						{categories.map((cat) => (
							<li key={cat.id}>
								<Input
									id={cat.id}
									label={decode(cat.name)}
									type='checkbox'
									className='flex items-center justify-between'
									checked={filters.category.includes(cat.id) ?? false}
									onChange={(e) =>
										setFilters({
											...filters,
											category: e.target.checked
												? [...filters.category, cat.id]
												: filters.category.filter(
														(c) => c !== cat.id
												  ),
										})
									}
								/>
							</li>
						))}
					</ul>
					<h6>Price Filter</h6>
					<ul>
						<li>
							<Input
								id='min-price'
								label='Min Price'
								type='number'
								className='flex items-center justify-between'
								value={filters.min_price}
								onChange={(e) =>
									setFilters({
										...filters,
										min_price: e.target.value,
									})
								}
							/>
						</li>
						<li>
							<Input
								id='max-price'
								label='Max Price'
								type='number'
								className='flex items-center justify-between'
								value={filters.max_price}
								onChange={(e) =>
									setFilters({
										...filters,
										max_price: e.target.value,
									})
								}
							/>
						</li>
					</ul>
					<h6>Sale Status</h6>
					<ul>
						<li>
							<Input
								id='sale-status'
								label='On Sale'
								type='checkbox'
								className='flex items-center justify-between'
								checked={filters.on_sale}
								onChange={(e) =>
									setFilters({
										...filters,
										on_sale: e.target.checked,
									})
								}
							/>
						</li>
					</ul>
				</div>
				{filteredProducts.length > 0 ? (
					<div className='flex flex-wrap space-x-2'>
						{filteredProducts.map((product) => (
							<div key={product.id}>
								<Link href={`/product/${product.slug}`}>
									<ProductTile
										image={product.images[0]}
										name={product.name}
									/>
								</Link>
							</div>
						))}
					</div>
				) : (
					<div>No Products Found</div>
				)}
			</section>
		</Layout>
	)
}

export const getStaticProps = async () => {
	const categories = await getCategories({
		per_page: 100,
		hide_empty: true,
		orderby: "name",
		order: "asc",
	})
	const headerFooter = await getHeaderFooterData()

	return {
		props: {
			headerFooter: { ...(headerFooter || {}), categories },
		},
	}
}

export default Filter
