import Header from "./header"
import Footer from "./footer"

const Layout = ({ pageTitle, children }) => {
	return (
		<div className='min-h-screen flex flex-col'>
			<Header pageTitle={pageTitle} />
			<div className='grow basis-[75vh]'>{children}</div>
			<Footer />
		</div>
	)
}

export default Layout
