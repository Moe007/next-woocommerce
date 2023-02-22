import axios from "axios"
import crypto from "crypto"
import dns from "dns"

export default async function handler(req, res) {
	const testingMode = process.env.NODE_ENV === "development"
	const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za"
	const passPhrase = process.env.PF_PASSPHRASE
	const pfData = JSON.parse(JSON.stringify(req.body))

	let pfParamString = ""
	for (let key in pfData) {
		if (pfData.hasOwnProperty(key) && key !== "signature") {
			pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(
				/%20/g,
				"+"
			)}&`
		}
	}

	// Remove last ampersand
	pfParamString = pfParamString.slice(0, -1)

	const pfValidSignature = async (pfData, pfParamString, pfPassphrase = null) => {
		// Calculate security signature
		let tempParamString = ""
		if (pfPassphrase !== null) {
			pfParamString += `&passphrase=${encodeURIComponent(
				pfPassphrase.trim()
			).replace(/%20/g, "+")}`
		}

		const signature = crypto.createHash("md5").update(pfParamString).digest("hex")
		return pfData["signature"] === signature
	}

	async function ipLookup(domain) {
		return new Promise((resolve, reject) => {
			dns.lookup(domain, { all: true }, (err, address, family) => {
				if (err) {
					reject(err)
				} else {
					const addressIps = address.map(function (item) {
						return item.address
					})
					resolve(addressIps)
				}
			})
		})
	}

	const pfValidIP = async (req) => {
		const validHosts = [
			"www.payfast.co.za",
			"sandbox.payfast.co.za",
			"w1w.payfast.co.za",
			"w2w.payfast.co.za",
		]

		let validIps = []
		const pfIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress

		try {
			for (let key in validHosts) {
				const ips = await ipLookup(validHosts[key])
				validIps = [...validIps, ...ips]
			}
		} catch (err) {
			console.error(err)
		}

		const uniqueIps = [...new Set(validIps)]

		if (uniqueIps.includes(pfIp)) {
			return true
		}
		return false
	}

	const pfValidPaymentData = async (cartTotal, pfData) => {
		return (
			Math.abs(parseFloat(cartTotal) - parseFloat(pfData["amount_gross"])) <= 0.01
		)
	}

	const pfValidServerConfirmation = async (pfHost, pfParamString) => {
		const result = await axios
			.post(`https://${pfHost}/eng/query/validate`, pfParamString)
			.then((res) => {
				return res.data
			})
			.catch((error) => {
				console.error(error)
			})
		return result === "VALID"
	}

	const getOrderTotal = async (pfData) => {
		try {
			const { data: order } = await axios.get(
				`${process.env.NEXT_PUBLIC_HOME_URL}/api/orders/${pfData.m_payment_id}`
			)
			return order.total
		} catch (error) {
			console.error(error)
		}
	}

	const cartTotal = await getOrderTotal(pfData)

	const check1 = await pfValidSignature(pfData, pfParamString, passPhrase)
	const check2 = await pfValidIP(req)
	const check3 = await pfValidPaymentData(cartTotal, pfData)
	const check4 = await pfValidServerConfirmation(pfHost, pfParamString)

	if (check1 && check2 && check3 && check4) {
		// All checks have passed, the payment is successful
		const note = { note: "Payment was successful!" }
		const { data, status } = await axios.post(
			`${process.env.NEXT_PUBLIC_HOME_URL}/api/orders/${pfData.m_payment_id}/notes`,
			note
		)
		res.status(status).json(data)
	} else {
		// Some checks have failed, check payment manually and log for investigation
		const note = { note: "Payment was unsuccessful!" }
		const { data, status } = await axios.post(
			`${process.env.NEXT_PUBLIC_HOME_URL}/api/orders/${pfData.m_payment_id}/notes`,
			note
		)
		res.status(status).json(data)
	}
}
