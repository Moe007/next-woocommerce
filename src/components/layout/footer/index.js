import { useHeader } from "@/context/HeaderContext"
import { decode } from "html-entities"
import Link from "next/link"
import { useEffect, useState } from "react"

const Footer = ({ pageTitle }) => {
	const { headerData } = useHeader()

	const [categories, setCategories] = useState([])
	const [description, setDescription] = useState("")

	useEffect(() => {
		if (headerData?.header) {
			setDescription(headerData.header.siteDescription)
		}
		if (headerData?.footer) {
		}
		if (headerData?.categories) {
			setCategories(headerData.categories)
		}
	}, [headerData])

	return (
		<footer className='space-y-4'>
			<section className='space-y-2'>
				{pageTitle === "Home" ? (
					<h2 className='font-semibold text-lg;'>About Us</h2>
				) : (
					<h6 className='font-semibold text-lg'>About Us</h6>
				)}
				<p>{description}</p>
			</section>
			<section className='space-y-2'>
				<h6 className='font-semibold text-lg'>Categories</h6>
				<ul>
					{categories.map((category) => (
						<li key={category.id}>
							<Link href={`/product/filter?category=${category.id}`}>
								{decode(category.name)}
							</Link>
						</li>
					))}
				</ul>
			</section>
		</footer>
	)
}

export default Footer
