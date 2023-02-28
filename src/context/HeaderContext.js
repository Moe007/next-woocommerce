import React, { useContext, useState } from "react"

const HeaderContext = React.createContext()

export const useHeader = () => useContext(HeaderContext)

export const HeaderProvider = ({ children }) => {
	const [headerData, setHeaderData] = useState(null)

	const setHeaderState = (data) => {
		if (data) {
			setHeaderData(data)
		}
	}

	return (
		<HeaderContext.Provider value={{ headerData, setHeaderState }}>
			{children}
		</HeaderContext.Provider>
	)
}
