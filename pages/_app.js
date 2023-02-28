import { CartProvider } from "@/context/CartContext"
import { HeaderProvider } from "@/context/HeaderContext"
import "@/styles/globals.css"

export default function App({ Component, pageProps }) {
	return (
		<CartProvider>
			<HeaderProvider>
				<Component {...pageProps} />
			</HeaderProvider>
		</CartProvider>
	)
}
