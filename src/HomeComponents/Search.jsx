import React, { useEffect, useState } from 'react'
import { history } from '../Apis/searchApi'

const Search = ({isSearchOpen , setIsSearchOpen}) => {
    const [recent, setRecent] = useState([])
    const [error, setError] = useState('')


    const [query, setQuery] =useState("")

    useEffect(()=>{
      if(!isSearchOpen)return;
      const fetchHistory = async()=>{
        setError("")
        try {

          const {data} = await history()
          setRecent(data.history)

        } catch (error) {
          setError(error.response?.data?.message || "Failed to fetch search history");
        }
        
      
      }
      fetchHistory()

    },[isSearchOpen])
    
    
    return (
      <div className="w-full  relative flex items-center justify-center" 
      onClick={(e)=>{
        e.stopPropagation()
        if(!isSearchOpen){
           setIsSearchOpen(true)
        }
       
      }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Trips, Posts or Users..."
          className="w-full border-[#969696] border-1 rounded-lg pl-5 pr-12 py-2 text-lg text-[#fff] placeholder-[#8D99AE] bg-[#353749] focus:outline-none focus:ring-1 focus:ring-[#ffffff] transition-all duration-400"
        />
        <i
          className="bx bx-search absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-[#EF233C]"
        ></i>
        {
        isSearchOpen  && (
          <div className="absolute top-full mt-2 w-full bg-[#2B2D42] rounded-lg shadow-lg z-50">
            {recent.map((item) => (
                <div key={item._id} className="px-4 py-2 hover:bg-[#353749] cursor-pointer">
              {item.query} ({item.type}
              )
        </div>
      ))}
    </div>
  )}

  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      </div>
    );
}

export default Search