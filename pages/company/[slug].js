import Layout from "@/components/layout"
import { useHeader } from "@/context/HeaderContext"
import { getCategories } from "@/utils/category"
import { getHeaderFooterData } from "@/utils/headerFooter"
import { getPages } from "@/utils/page"
import { decode } from "html-entities"
import DOMPurify from "isomorphic-dompurify"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Company = ({ headerFooter, page }) => {
	const { setHeaderState } = useHeader()

	useEffect(() => {
		setHeaderState(headerFooter)
	}, [headerFooter, setHeaderState])

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
		<Layout pageTitle={decode(page.title.rendered)}>
			<article className='blog'>
				<h1 className='blog-header'>{decode(page.title.rendered)}</h1>
				<div
					className='blog-body'
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(page.content.rendered),
					}}
				/>
			</article>
		</Layout>
	)
}

export const getStaticPaths = async () => {
	const { footer } = await getHeaderFooterData()

	const paths = footer.footerMenuItems.map((item) => {
		return {
			params: { slug: item.pageSlug },
		}
	})

	return {
		paths,
		fallback: true,
	}
}

export const getStaticProps = async (ctx) => {
	const headerFooter = await getHeaderFooterData()

	const categories = await getCategories({
		per_page: 100,
		hide_empty: true,
		orderby: "name",
		order: "asc",
		_fields: ["id", "slug", "name", "count"],
	})

	const pages = await getPages({ slug: ctx.params.slug })

	if (!pages?.[0]) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			headerFooter: { ...(headerFooter || {}), categories },
			page: pages[0],
		},
		revalidate: 1,
	}
}

export default Company
