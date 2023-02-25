import { CartProvider } from "@/context/CartContext"
import { SearchTermProvider } from "@/context/SearchTermContext"
import "@/styles/globals.css"

export default function App({ Component, pageProps }) {
	return (
		<CartProvider>
			<SearchTermProvider>
				<Component {...pageProps} />
			</SearchTermProvider>
		</CartProvider>
	)
}
