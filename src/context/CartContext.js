import axios from "axios"
import React, { useContext, useState, useEffect } from "react"

const CartContext = React.createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [cartData, setCartData] = useState(null)

	const setCartState = async () => {
		const { data } = await axios.get(`/api/cart`, {
			params: { cart_key: localStorage.getItem("cartKey") || "" },
		})
		data.items = data.items?.map((item) => {
			return {
				...item,
				name:
					item.meta.product_type === "variation"
						? `${item.title} - (${Object.values(item.meta.variation).join(
								", "
						  )})`
						: item.name,
			}
		})
		setCartData(data)
		localStorage.setItem("cartKey", data?.cart_key)
	}

	useEffect(() => {
		setCartState()
	}, [])

	return (
		<CartContext.Provider value={{ cartData, setCartState }}>
			{children}
		</CartContext.Provider>
	)
}
