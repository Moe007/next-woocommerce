import { useState } from "react"
import { useCart } from "@/context/CartContext"
import LineItem from "@/components/cart/lineItem"
import CartTotals from "./cartTotals"

const Cart = () => {
	const { cartData } = useCart()

	const [cartMenu, setCartMenu] = useState(false)

	const cartMenuClick = () => {
		setCartMenu(!cartMenu)
	}

	return (
		<div
			onClick={cartMenuClick}
			className='inline-flex align-middle items-center text-themeWhite space-x-1'
		>
			Cart:
			<span className='relative text-xs xs:text-sm sm:text-base'>
				{" "}
				{cartData?.item_count}
			</span>
			{cartMenu ? (
				<div className='fixed inset-0 z-40 w-full h-full bg-themeLilac opacity-20' />
			) : (
				""
			)}
			<div
				onClick={(e) => e.stopPropagation()}
				aria-modal='true'
				aria-labelledby='cartmenu-label'
				className={`absolute top-0 -right-6 transition-all z-50 w-full lg:w-1/3 h-screen bg-sky-500 flex flex-col items-center space-y-4 p-4 text-black overflow-y-auto ${
					cartMenu ? "visible -translate-x-6" : "invisible"
				}`}
			>
				<button aria-label='Close cart' onClick={cartMenuClick}>
					Close
				</button>
				<h3
					id='cartmenu-label'
					className='text-xl xs:text-2xl sm:text-3xl xl:hidden font-bold tracking-widest'
				>
					Cart
				</h3>
				{cartData?.items.length > 0 ? (
					<div className='w-3/4 lg:w-11/12 grow space-y-4'>
						<CartTotals
							checkoutBtn={true}
							subtotal={cartData?.totals.subtotal}
							shippingTotal={cartData?.totals.shipping_total}
							total={cartData?.totals.total}
						/>
						<ul className='flex flex-col h-2/3 shadow-3xl bg-white bg-opacity-90 overflow-y-auto rounded-sm'>
							{cartData?.items.map((item) => (
								<li className='w-full p-4' key={item.id}>
									<LineItem
										itemKey={item.item_key}
										title={item.name}
										image={item.featured_image}
										price={item.totals.total}
										quantity={item.quantity.value}
										maxQty={item.quantity.max_purchase}
									/>
								</li>
							))}
						</ul>
					</div>
				) : (
					<div>Cart is empty</div>
				)}
			</div>
		</div>
	)
}

export default Cart
