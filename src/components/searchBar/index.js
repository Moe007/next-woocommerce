import axios from "axios"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import Input from "../form/input"
import useDebounce from "@/hooks/useDebounce"
import { useRouter } from "next/router"
import ProductTile from "@/components/productTile"
import useTimeout from "@/hooks/useTimeout"

const SearchBar = () => {
	const router = useRouter()

	const [term, setTerm] = useState("")
	const [pages, setPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [filteredProducts, setFilteredProducts] = useState([])
	const [maxLen, setMaxLen] = useState(8)
	const [focus, setFocus] = useState(false)

	const { width: windowWidth } = useWindowDimensions()

	const filter = () => {
		router.push(`/product/filter?term=${term}`)
	}

	useEffect(() => {
		// Condition 1 - md screens (not lg screens)
		// Condition 2 - xl screens and up
		if (windowWidth >= 1280) {
			setMaxLen(12)
		} else if (windowWidth >= 640) {
			setMaxLen(10)
		} else {
			setMaxLen(8)
		}
	}, [windowWidth])

	useDebounce(
		() => {
			if (term.length >= 2) {
				setLoading(true)
				const search = async () => {
					const {
						data: { products, pages },
					} = await axios.get(
						`${
							process.env.NEXT_PUBLIC_HOME_URL
						}/api/product?per_page=${1}&search=${term}`
					)
					setFilteredProducts(products)
					setPages(pages)
					setLoading(false)
				}
				search()
			} else {
				setFilteredProducts([])
			}
		},
		500,
		[term, setFilteredProducts]
	)

	const unFocus = () => {
		setTimeout(() => {
			setFocus(false)
		}, 100)
	}

	return (
		<form
			className='relative'
			onSubmit={(e) => {
				e.preventDefault()
				filter()
				unFocus()
			}}
			onFocus={(e) => setFocus(true)}
			onBlur={unFocus}
		>
			<div className='relative'>
				<Input
					inpClass='text-center text-black rounded-xl'
					lblClass='hidden'
					className='rounded-xl grow'
					type='search'
					placeholder=''
					value={term || ""}
					onChange={(e) => setTerm(e.target.value)}
				/>
			</div>
			<div
				className={`absolute bg-sky-300 shadow-xl top-full w-full rounded p-4 ${
					!focus ? "hidden" : ""
				} `}
			>
				{loading ? (
					<div>Searching...</div>
				) : filteredProducts.length >= 1 ? (
					<div className='flex flex-wrap space-x-[calc((100%-(4*(100vw-64px)*0.20))/3)] xs:space-x-[calc((100%-(4*(100vw-96px)*0.20))/3)] sm:space-x-0 xl:space-x-[5%] sm:justify-evenly space-y-4 w-full'>
						{filteredProducts.slice(0, maxLen).map((prod) => (
							<div
								className='sm:w-[16.67%] xl:w-[12.5%]'
								onClick={() => setTerm("")}
								key={prod.id}
							>
								<Link href={`/product/${prod.slug}`}>
									<ProductTile
										name={prod.name}
										image={prod.images[0]}
									/>
								</Link>
							</div>
						))}
						{filteredProducts.length > maxLen || pages >= 2 ? (
							<button onClick={filter} className='button'>
								Load More
							</button>
						) : (
							""
						)}
					</div>
				) : (
					<div>
						<p>No products found</p>
					</div>
				)}
			</div>
		</form>
	)
}

export default SearchBar
