import axios from "axios"
import Script from "next/script"
import { useEffect, useState } from "react"
import Input from "@/components/form/input"
import { useCart } from "@/context/CartContext"
import Layout from "@/components/layout"
import CartTotals from "@/components/cart/cartTotals"
import Notification from "@/components/notification"

const Checkout = () => {
	const { cartData, setCartState } = useCart()

	const getChosenShippingMethod = () =>
		Object.entries(cartData?.shipping.packages?.default?.rates ?? {}).find(
			([key, value]) => value.chosen_method
		)?.[1]

	const [sameShippingInfo, setSameShippingInfo] = useState(false)
	const [loading, setLoading] = useState(false)

	const [formData, setFormData] = useState({
		bFName: "",
		bLName: "",
		email: "",
		cell: "",
		bAddress1: "",
		bAddress2: "",
		bCity: "",
		bProvince: "",
		bPostCode: "",
		shippingMethod: getChosenShippingMethod(),
		sFName: "",
		sLName: "",
		sAddress1: "",
		sAddress2: "",
		sCity: "",
		sProvince: "",
		sPostCode: "",
	})

	useEffect(() => {
		setFormData({ ...formData, shippingMethod: getChosenShippingMethod() })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cartData])

	const [transaction, setTransaction] = useState({
		completed: false,
		error: false,
		message: "",
	})

	const handleSubmit = async (e) => {
		setLoading(true)
		e.preventDefault()
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		})

		if (sameShippingInfo) {
			setFormData({
				...formData,
				sFName: "",
				sLName: "",
				sAddress1: "",
				sAddress2: "",
				sCity: "",
				sProvince: "",
				sPostCode: "",
			})
		}
		try {
			const {
				data: { uuid, id: orderId },
			} = await axios.post("/api/checkout", { ...formData, cartData })

			if (uuid) {
				window.payfast_do_onsite_payment({ uuid }, async (result) => {
					if (result === true) {
						try {
							await axios.put("/api/checkout", { orderId })
							await axios.post(
								"/api/cart/clear",
								{},
								{
									params: {
										cart_key: localStorage.getItem("cartKey"),
									},
								}
							)
							setCartState()
							setTransaction({
								...transaction,
								completed: true,
								error: false,
							})
						} catch (error) {
							console.log("Error :>> ", error)
							setTransaction({
								...transaction,
								completed: false,
								error: true,
							})
						}
					} else {
						setTransaction({
							...transaction,
							completed: false,
							error: true,
						})
					}
				})
			} else {
				alert("Something went wrong!")
			}
		} catch (error) {
			console.log("error", error.response.data.message)
			setTransaction({
				...transaction,
				completed: false,
				error: true,
				message: error.response.data.message,
			})
		}
		setLoading(false)
	}

	return (
		<Layout pageTitle='Checkout'>
			{transaction.completed === false ? (
				<div className='checkout-page'>
					<h2>Checkout</h2>
					{transaction.error === true ? (
						<Notification
							type='error'
							message={
								transaction.message ||
								"Payment was unsuccessful, please try again or contact support."
							}
						/>
					) : (
						""
					)}
					{loading && <Notification message='Loading...' />}
					<form onSubmit={handleSubmit}>
						<div className='billing-info'>
							<h5>Billing Details</h5>
							<Input
								id='firstName'
								label='First Name(s)*'
								placeholder='John'
								required={true}
								value={formData.bFName}
								onChange={(e) =>
									setFormData({ ...formData, bFName: e.target.value })
								}
							/>
							<Input
								id='lastName'
								label='Last Name*'
								placeholder='Doe'
								required={true}
								value={formData.bLName}
								onChange={(e) =>
									setFormData({ ...formData, bLName: e.target.value })
								}
							/>
							<Input
								id='email'
								type='email'
								label='Email*'
								placeholder='john@example.com'
								required={true}
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
							/>
							<Input
								id='cell'
								label='Cellphone Number*'
								placeholder='Cell Num'
								required={true}
								value={formData.cell}
								onChange={(e) =>
									setFormData({ ...formData, cell: e.target.value })
								}
							/>
							<Input
								id='address1'
								label='Address 1*'
								placeholder='Address'
								className='address'
								required={true}
								value={formData.bAddress1}
								onChange={(e) =>
									setFormData({
										...formData,
										bAddress1: e.target.value,
									})
								}
							/>
							<Input
								id='address2'
								label='Address 2 (Optional)'
								placeholder='Apartment num, suite num...'
								value={formData.bAddress2}
								onChange={(e) =>
									setFormData({
										...formData,
										bAddress2: e.target.value,
									})
								}
							/>
							<Input
								id='city'
								label='City*'
								placeholder='City'
								required={true}
								value={formData.bCity}
								onChange={(e) =>
									setFormData({ ...formData, bCity: e.target.value })
								}
							/>
							<Input
								id='province'
								label='Province*'
								placeholder='Province'
								required={true}
								value={formData.bProvince}
								onChange={(e) =>
									setFormData({
										...formData,
										bProvince: e.target.value,
									})
								}
							/>
							<Input
								id='pCode'
								label='Postal Code*'
								placeholder='Postal Code'
								required={true}
								value={formData.bPostCode}
								pattern='[0-9]*'
								onChange={(e) => {
									if (e.target.value.match("^[0-9]*$") != null) {
										setFormData({
											...formData,
											bPostCode: e.target.value,
										})
									}
								}}
							/>
						</div>
						<div
							className={`shipping-info ${
								sameShippingInfo ? "[&>:nth-child(n+4)]:hidden" : ""
							}`}
						>
							<h5>Shipping Details</h5>
							<fieldset>
								<legend>Select a shipping method: </legend>
								<Input
									id='delivery'
									label='Delivery'
									type='radio'
									name='shipping'
									defaultChecked={true}
									onChange={(e) => {
										setFormData({
											...formData,
											shippingMethod: getChosenShippingMethod(),
										})
									}}
								/>
								<Input
									id='delivery'
									label='Collection'
									type='radio'
									name='shipping'
									value='local_pickup'
									onChange={(e) => {
										setFormData({
											...formData,
											shippingMethod: e.target.value,
										})
									}}
								/>
							</fieldset>
							<Input
								id='asBilling'
								label='Same as billing?'
								type='checkbox'
								defaultChecked={sameShippingInfo}
								onChange={(e) =>
									e.target.checked
										? setSameShippingInfo(true)
										: setSameShippingInfo(false)
								}
							/>
							<Input
								id='firstName'
								label='First Name(s)'
								placeholder='John'
								value={formData.sFName}
								onChange={(e) =>
									setFormData({ ...formData, sFName: e.target.value })
								}
							/>
							<Input
								id='lastName'
								label='Last Name'
								placeholder='Doe'
								value={formData.sLName}
								onChange={(e) =>
									setFormData({ ...formData, sLName: e.target.value })
								}
							/>
							<Input
								id='address1'
								label='Address 1'
								placeholder='Address'
								className='address'
								value={formData.sAddress1}
								onChange={(e) =>
									setFormData({
										...formData,
										sAddress1: e.target.value,
									})
								}
							/>
							<Input
								id='address2'
								label='Address 2 (Optional)'
								placeholder='Apartment num, suite num...'
								value={formData.sAddress2}
								onChange={(e) =>
									setFormData({
										...formData,
										sAddress2: e.target.value,
									})
								}
							/>
							<Input
								id='city'
								label='City'
								placeholder='City'
								value={formData.sCity}
								onChange={(e) =>
									setFormData({ ...formData, sCity: e.target.value })
								}
							/>
							<Input
								id='province'
								label='Province'
								placeholder='Province'
								value={formData.sProvince}
								onChange={(e) =>
									setFormData({
										...formData,
										sProvince: e.target.value,
									})
								}
							/>
							<Input
								id='pCode'
								label='Postal Code'
								placeholder='Postal Code'
								value={formData.sPostCode}
								pattern='[0-9]*'
								onChange={(e) => {
									if (e.target.value.match("^[0-9]*$") != null) {
										setFormData({
											...formData,
											sPostCode: e.target.value,
										})
									}
								}}
							/>
						</div>
						<div className='totals-container'>
							<CartTotals
								subtotal={cartData?.totals.subtotal}
								shippingTotal={
									formData.shippingMethod === "local_pickup"
										? 0
										: cartData?.totals.shipping_total
								}
								total={
									formData.shippingMethod === "local_pickup"
										? cartData?.totals.total -
										  cartData?.totals.shipping_total
										: cartData?.totals.total
								}
							/>
							<button type='submit'>Continue to Payment</button>
						</div>
					</form>
				</div>
			) : (
				<Notification message='Your order has been received!' />
			)}

			<Script src={process.env.NEXT_PUBLIC_PF_SCRIPT} />
		</Layout>
	)
}

export default Checkout
