import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import useDebounce from "@/hooks/useDebounce"

const LineItem = ({ itemKey, title, image, price, quantity, maxQty }) => {
	const [qty, setQty] = useState(quantity)
	const { setCartState } = useCart()

	useEffect(() => {
		if (!qty || qty < 1) {
			setQty(quantity)
		} else if (qty > maxQty && maxQty != -1) {
			setQty(maxQty)
		}
	}, [qty, setQty, maxQty, quantity])

	useEffect(() => {
		setQty(quantity)
	}, [quantity])

	useDebounce(
		() => {
			const updateCart = async () => {
				try {
					const res = await axios.post(
						`${process.env.NEXT_PUBLIC_HOME_URL}/api/cart/item/${itemKey}`,
						{ quantity: qty },
						{
							params: {
								cart_key: localStorage.getItem("cartKey"),
							},
						}
					)
					setCartState()
				} catch (error) {
					console.error(error)
				}
			}
			updateCart()
		},
		500,
		[qty]
	)

	return (
		<div className='relative flex justify-between w-full'>
			<button
				className=' absolute cursor-pointer -top-1.5 -left-1.5 md:-top-2 md:-left-2 z-20 sm:w-6 sm:h-6 lg:w-5 lg:h-5'
				onClick={async () => {
					const response = await axios.delete(
						`${process.env.NEXT_PUBLIC_HOME_URL}/api/cart/item/${itemKey}`,
						{
							params: {
								cart_key: localStorage.getItem("cartKey"),
							},
						}
					)
					setCartState()
				}}
			>
				Delete
			</button>
			<div className='basis-1/3 md:basis-1/4 lg:basis-1/3'>
				<Image
					alt={`Thumbnail image of ${title}`}
					src={image}
					width={300}
					height={400}
				/>
			</div>
			<div className='basis-1/3 md:basis-1/4 lg:basis-1/2 flex flex-col items-center text-xs xs:text-sm md:text-base lg:text-sm justify-between'>
				<h6 className='font-semibold tracking-wide'>{title}</h6>
				<div className='qty'>
					Quantity:{" "}
					<input
						className='font-semibold w-4/12 mx-1 text-black text-center rounded-sm overflow-visible'
						type='number'
						name='quantity'
						min='1'
						onChange={(e) => setQty(parseInt(e.target.value))}
						value={qty}
					/>
				</div>
				<div className='total'>Total: R{price?.toFixed(2)}</div>
			</div>
		</div>
	)
}

export default LineItem
