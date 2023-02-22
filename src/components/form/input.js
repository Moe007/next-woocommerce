const Input = ({
	id,
	placeholder = "",
	label = "",
	type = "text",
	className,
	inpClass,
	lblClass,
	...rest
}) => {
	return (
		<div className={`transition duration-150 ease-in-out rounded ${className}`}>
			<label htmlFor={id} className={`text-xs font-light px-2 pt-1 ${lblClass}`}>
				{label}
			</label>
			{type !== "textarea" ? (
				<input
					type={type}
					className={`w-full px-2 py-1 outline-none placeholder-gray-500 text-sm xs:text-base font-light rounded-md ${inpClass}`}
					id={id}
					placeholder={placeholder}
					{...rest}
				/>
			) : (
				<textarea
					className={`w-full px-2 py-1 outline-none placeholder-gray-500 text-sm xs:text-base font-light rounded-md ${inpClass}`}
					id={id}
					placeholder={placeholder}
					{...rest}
				/>
			)}
		</div>
	)
}

export default Input
