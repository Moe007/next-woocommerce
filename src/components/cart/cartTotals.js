import Link from "next/link"

const CartTotals = ({ checkoutBtn = false, subtotal, shippingTotal, total }) => {
	return (
		<div className='text-black shadow-3xl md:basis-2/6 h-fit mx-4 xs:mx-6 sm:mx-12 md:mx-0 flex flex-col justify-center space-y-3 sm:space-y-4 py-4 sm:py-5 md:py-3 2xl:py-6 bg-white rounded-sm mb-4'>
			<h4 className='font-semibold mx-auto tracking-widest text-lg sm:text-xl md:text-2xl lg:text-xl 2xl:text-3xl'>
				Cart Totals
			</h4>
			<div className='text-xs sm:text-sm md:text-base lg:text-sm 2xl:text-lg mx-4 xs:mx-6 sm:mx-12 md:mx-16 lg:mx-12 xl:mx-16 tracking-wider flex justify-between'>
				<span>Subtotal</span>
				<span>R{(Number(subtotal) / 100).toFixed(2)}</span>
			</div>
			<div className='text-xs sm:text-sm md:text-base lg:text-sm 2xl:text-lg mx-4 xs:mx-6 sm:mx-12 md:mx-16 lg:mx-12 xl:mx-16 tracking-wider flex justify-between'>
				<span>Delivery</span>
				<span>R{(Number(shippingTotal) / 100).toFixed(2)}</span>
			</div>
			<div className='border-b-2 mx-4 xs:mx-6 sm:mx-12 md:mx-16 lg:mx-12 xl:mx-16' />
			<div className='text-xs sm:text-sm md:text-base lg:text-sm 2xl:text-lg mx-4 xs:mx-6 sm:mx-12 md:mx-16 lg:mx-12 xl:mx-16 tracking-wider flex justify-between'>
				<span>Total</span>
				<span>R{(Number(total) / 100).toFixed(2)}</span>
			</div>
			{checkoutBtn === true ? (
				<Link href='/checkout' passHref>
					<div className='text-center mx-4 xs:mx-6 sm:mx-12 md:mx-16 lg:mx-auto bg-sky-500 rounded-lg font-semibold uppercase text-sm xs:text-base tracking-wide xs:tracking-wider lg:w-1/2'>
						Checkout
					</div>
				</Link>
			) : (
				""
			)}
		</div>
	)
}

export default CartTotals
