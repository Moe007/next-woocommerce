import { useState } from "react"

const Notification = ({ type = "info", message = "", closeable = false }) => {
	const [show, setShow] = useState(true)

	return (
		<div
			className={`mx-auto bg-amber-500 p-2 rounded-lg text-center flex items-center justify-between space-x-2 space-y-2 ${
				type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : ""
			} ${show ? "" : "hidden"}`}
		>
			<span className='w-full'>{message}</span>
			<button
				onClick={() => setShow(false)}
				className={`${
					!closeable && "hidden"
				} h-6 w-6 lg:h-8 lg:w-8 cursor-pointer`}
			>
				X
			</button>
		</div>
	)
}

export default Notification
