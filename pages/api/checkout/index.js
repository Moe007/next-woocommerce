import axios from "axios"
import crypto from "crypto"

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default

const api = new WooCommerceRestApi({
	url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
	consumerKey: process.env.WC_CONSUMER_KEY,
	consumerSecret: process.env.WC_CONSUMER_SECRET,
	queryStringAuth: true,
	version: "wc/v3",
})

export default async function handler(req, res) {
	if (req.method === "POST") {
		try {
			const testingMode = process.env.NODE_ENV === "development"
			const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za"

			if (Number(req.body.cartData.totals.total / 100) < 250) {
				res.status(400).json({ message: "Minimum order amount is R250" })
			} else {
				const items = req.body.cartData.items.map((item) =>
					item.meta.product_type === "variation"
						? { variation_id: item.id, quantity: item.quantity.value }
						: { product_id: item.id, quantity: item.quantity.value }
				)

				const method_id =
					req.body.shippingMethod === "local_pickup"
						? "local_pickup"
						: req.body.shippingMethod.method_id
				const method_title =
					req.body.shippingMethod === "local_pickup"
						? "Local pickup"
						: req.body.shippingMethod.label
				const shippingTotal =
					req.body.shippingMethod === "local_pickup"
						? 0
						: Number(req.body.shippingMethod.cost / 100).toFixed(2)

				const data = {
					payment_method: "payfast",
					payment_method_title: "PayFast",
					set_paid: false,
					billing: {
						first_name: req.body.bFName,
						last_name: req.body.bLName,
						address_1: req.body.bAddress1,
						address_2: req.body.bAddress2,
						city: req.body.bCity,
						state: req.body.bProvince,
						postcode: req.body.bPostCode,
						country: "ZA",
						email: req.body.email,
						phone: req.body.cell,
					},
					shipping: {
						first_name: req.body.sFName || req.body.bFName,
						last_name: req.body.sLName || req.body.bLName,
						address_1: req.body.sAddress1 || req.body.bAddress1,
						address_2: req.body.sAddress2 || req.body.bAddress2,
						city: req.body.sCity || req.body.bCity,
						state: req.body.sProvince || req.body.bProvince,
						postcode: req.body.sPostCode || req.body.bPostCode,
						country: "ZA",
					},
					line_items: items,
					shipping_lines:
						method_id !== "local_pickup"
							? [
									{
										method_id,
										method_title,
										total: shippingTotal,
									},
							  ]
							: [{ method_id, method_title }],
				}

				const { data: orderData, status } = await api.post("orders", data)

				if (status === 201) {
					const pfData = {
						merchant_id: process.env.PF_MERCHANT_ID,
						merchant_key: process.env.PF_MERCHANT_KEY,
						notify_url: `${
							process.env.NODE_ENV === "development"
								? process.env.NEXT_PUBLIC_HOSTED_HOME_URL
								: process.env.NEXT_PUBLIC_HOME_URL
						}/api/checkout/notify`,
						name_first: req.body.bFName,
						name_last: req.body.bLName,
						email_address: req.body.email,
						cell_number: req.body.cell,
						m_payment_id: orderData.number,
						amount: orderData.total,
						item_name: orderData.order_key,
						email_confirmation: "1",
					}
					const passPhrase = process.env.PF_PASSPHRASE

					const dataToString = (dataArray) => {
						// Convert your data array to a string
						let pfParamString = ""
						for (let key in dataArray) {
							if (dataArray.hasOwnProperty(key)) {
								pfParamString += `${key}=${encodeURIComponent(
									dataArray[key].trim()
								).replace(/%20/g, "+")}&`
							}
						}
						// Remove last ampersand
						return pfParamString.slice(0, -1)
					}

					const generatePaymentIdentifier = async (pfParamString) => {
						const result = await axios
							.post(`https://${pfHost}/onsite/process`, pfParamString)
							.then((res) => {
								return res.data.uuid || null
							})
							.catch((error) => {
								console.error(error)
							})
						return result
					}

					const generateSignature = (data, passPhrase = null) => {
						// Create parameter string
						let pfOutput = ""
						for (let key in data) {
							if (data.hasOwnProperty(key)) {
								if (data[key] !== "") {
									pfOutput += `${key}=${encodeURIComponent(
										data[key].trim()
									).replace(/%20/g, "+")}&`
								}
							}
						}

						// Remove last ampersand
						let getString = pfOutput.slice(0, -1)
						if (passPhrase !== null) {
							getString += `&passphrase=${encodeURIComponent(
								passPhrase.trim()
							).replace(/%20/g, "+")}`
						}

						return crypto.createHash("md5").update(getString).digest("hex")
					}

					// Generate signature (see Custom Integration -> Step 2)
					pfData["signature"] = generateSignature(pfData, passPhrase)

					// Convert the data array to a string
					const pfParamString = dataToString(pfData)

					// Generate payment identifier
					const identifier = await generatePaymentIdentifier(pfParamString)

					res.status(status).json({ uuid: identifier, id: orderData.id })
				} else {
					res.status(status).json({ message: "Error when creating order" })
				}
			}
		} catch (error) {
			res.json(error)
		}
	} else if (req.method === "PUT") {
		try {
			const { data: notes } = await api.get(`orders/${req.body.orderId}/notes`)
			// Make sure payfast received payment
			if (notes[0]?.note === "Payment was successful!") {
				const { data, status } = await api.put(`orders/${req.body.orderId}`, {
					set_paid: true,
				})
				res.status(status).json(data)
			} else {
				res.status(403).json({ message: "Payment was unsuccessful!" })
			}
		} catch (error) {
			res.json(error)
		}
	}
}
