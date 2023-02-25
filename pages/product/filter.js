import useDebounce from "@/hooks/useDebounce"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import ProductTile from "@/components/productTile"
import Link from "next/link"
import Layout from "@/components/layout"
import Input from "@/components/form/input"

const Filter = () => {
	const router = useRouter()
	const [term, setTerm] = useState("")
	const [loading, setLoading] = useState(false)
	const [filteredProducts, setFilteredProducts] = useState([])
	const [filters, setFilters] = useState({
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

export default Filter
