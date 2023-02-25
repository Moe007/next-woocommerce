import React, { useContext, useState } from "react"

const SearchTermContext = React.createContext()

export const useSearchTerm = () => useContext(SearchTermContext)

export const SearchTermProvider = ({ children }) => {
	const [searchTerm, setSearchTerm] = useState("")

	return (
		<SearchTermContext.Provider value={{ searchTerm, setSearchTerm }}>
			{children}
		</SearchTermContext.Provider>
	)
}
