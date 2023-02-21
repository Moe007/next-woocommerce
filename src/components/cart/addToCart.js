import { useCart } from "@/context/CartContext"
import axios from "axios"
import { useState, useEffect } from "react"

const AddToCart = ({ productId, variation }) => {
	const [qty, setQty] = useState(1)
	const { setCartState } = useCart()

	useEffect(() => {
		if (!qty || qty < 1) {
			setQty(1)
		}
	}, [qty, setQty])

	return (
		<div className='flex basis-4/6 bg-sky-400 text-gray rounded-lg py-1'>
			<button
				onClick={async () => {
					const response = await axios.post(
						`${process.env.NEXT_PUBLIC_HOME_URL}/api/cart`,
						{ id: productId, quantity: qty, variation },
						{ params: { cart_key: localStorage.getItem("cartKey") } }
					)
					console.log(response)
					setCartState()
				}}
				className='font-semibold uppercase text-sm xs:text-base sm:text-sm md:text-base xl:text-lg tracking-wide xs:tracking-wider sm:tracking-wide md:tracking-wider w-7/12'
			>
				Add to Cart
			</button>
			<button
				onClick={() => setQty(qty - 1)}
				disabled={qty === 1 ? true : false}
				className='disabled:bg-opacity-75 hidden xs:inline sm:hidden md:inline font-semibold xs:w-1/12 bg-themeBlue text-black rounded'
			>
				-
			</button>
			<input
				type='number'
				name='quantity'
				className='font-semibold w-4/12 xs:w-2/12 sm:w-4/12 md:w-2/12 mx-1 text-black text-center rounded-sm overflow-visible'
				min='1'
				onChange={(e) => setQty(parseInt(e.target.value))}
				value={qty}
			/>
			<button
				onClick={() => setQty(qty + 1)}
				className='hidden xs:inline sm:hidden md:inline font-semibold xs:w-1/12 bg-fuchsia-500 text-black rounded'
			>
				+
			</button>
		</div>
	)
}

export default AddToCart
