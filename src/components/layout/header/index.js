import Cart from "@/components/cart"
import SearchBar from "@/components/searchBar"
import Link from "next/link"

const Header = ({ pageTitle }) => {
	return (
		<header className='bg-blue-800 text-white p-2 flex justify-between space-x-8'>
			<Link href='/'>
				{pageTitle === "Home" ? <h1>ShoeShop</h1> : <h6>ShoeShop</h6>}
			</Link>
			<div className='grow'>
				<SearchBar />
			</div>
			<div>
				<Cart />
			</div>
		</header>
	)
}

export default Header
