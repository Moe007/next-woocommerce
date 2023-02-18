import Image from "next/image"
import React from "react"

const ProductTile = ({ name, image, price }) => {
	return (
		<div>
			<Image
				alt={image.alt || `Image of ${name}`}
				src={image.src}
				width={300}
				height={400}
			/>
			<h4>{name}</h4>
			<p>{price}</p>
		</div>
	)
}

export default ProductTile
