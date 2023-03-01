import Header from "./header"
import Footer from "./footer"
import CookieConsent from "react-cookie-consent"
import Link from "next/link"

const Layout = ({ pageTitle, children }) => {
	return (
		<div className='min-h-screen flex flex-col'>
			<Header pageTitle={pageTitle} />
			<div className='grow basis-[75vh]'>{children}</div>
			<Footer />
			<CookieConsent
				acceptOnScroll={true}
				acceptOnScrollPercentage={10}
				buttonClasses='!bg-blue-800 !text-white !rounded'
				containerClasses='!bg-sky-600 !text-white !text-sm'
			>
				This website uses cookies to enhance the user experience. By continuing to
				browse, you consent to our{" "}
				<Link href='/company/privacy-policy'>
					<span className='underline'>cookie policy</span>
				</Link>
			</CookieConsent>
		</div>
	)
}

export default Layout
