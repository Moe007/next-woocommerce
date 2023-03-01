import { useHeader } from "@/context/HeaderContext"
import { decode } from "html-entities"
import Link from "next/link"
import { useEffect, useState } from "react"

const Footer = ({ pageTitle }) => {
	const { headerData } = useHeader()

	const [categories, setCategories] = useState([])
	const [description, setDescription] = useState("")
	const [companyPages, setCompanyPages] = useState([])
	const [socials, setSocials] = useState([])

	useEffect(() => {
		if (headerData?.header) {
			setDescription(decode(headerData.header.siteDescription))
		}
		if (headerData?.footer) {
			const { footerMenuItems, socialLinks } = headerData.footer
			setSocials(socialLinks)
			setCompanyPages(footerMenuItems)
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
			<section className='space-y-2'>
				<h6 className='font-semibold text-lg'>Company</h6>
				<ul>
					{companyPages.map((page) => (
						<li key={page.ID}>
							<Link href={`/company/${page.pageSlug}`} passHref>
								{decode(page.title)}
							</Link>
						</li>
					))}
				</ul>
			</section>
			<section className='space-y-2'>
				<h6 className='font-semibold text-lg'>Socials</h6>
				<ul>
					{socials.map((social) => {
						switch (social.iconName) {
							case "facebook":
								return (
									<li key={social.iconName}>
										<a
											href={social.iconUrl}
											target='_blank'
											rel='noopener noreferrer'
											aria-label='Visit our Facebook page'
										>
											Facebook{" "}
										</a>
									</li>
								)
							case "twitter":
								return (
									<li key={social.iconName}>
										<a
											href={social.iconUrl}
											target='_blank'
											rel='noopener noreferrer'
											aria-label='Visit our Twitter page'
										>
											Twitter{" "}
										</a>
									</li>
								)
							case "instagram":
								return (
									<li key={social.iconName}>
										<a
											href={social.iconUrl}
											target='_blank'
											rel='noopener noreferrer'
											aria-label='Visit our Instagram page'
										>
											Instagram{" "}
										</a>
									</li>
								)
							case "youtube":
								return (
									<li key={social.iconName}>
										<a
											href={social.iconUrl}
											target='_blank'
											rel='noopener noreferrer'
											aria-label='Visit our Youtube page'
										>
											YouTube{" "}
										</a>
									</li>
								)
						}
					})}
				</ul>
			</section>
		</footer>
	)
}

export default Footer
