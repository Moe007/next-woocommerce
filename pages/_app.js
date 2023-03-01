import { CartProvider } from "@/context/CartContext"
import { HeaderProvider } from "@/context/HeaderContext"
import "@/styles/globals.css"
import { DefaultSeo } from "next-seo"

export default function App({ Component, pageProps }) {
	return (
		<>
			<DefaultSeo
				title={null}
				titleTemplate='%s | Next Woocommerce Template'
				defaultTitle='Next Woocommerce Template'
				description={`A Template of an e-commerce site with NextJS and Woocommerce`}
				canonical={process.env.NEXT_PUBLIC_HOME_URL}
				openGraph={{
					url: process.env.NEXT_PUBLIC_HOME_URL,
					title: "Next Woocommerce Template",
					description: `A Template of an e-commerce site with NextJS and Woocommerce`,
					siteName: "Next Woocommerce Template",
				}}
			/>
			<CartProvider>
				<HeaderProvider>
					<Component {...pageProps} />
				</HeaderProvider>
			</CartProvider>
		</>
	)
}
