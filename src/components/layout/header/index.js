const Header = ({ pageTitle }) => {
	return (
		<header className='bg-blue-800 text-white p-2 flex justify-between'>
			{pageTitle === "Home" ? <h1>ShoeShop</h1> : <h6>ShoeShop</h6>}
			<div>
				Cart: <span>0</span>
			</div>
		</header>
	)
}

export default Header
