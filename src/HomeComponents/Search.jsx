import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
const Search = ({isSearchOpen , setIsSearchOpen}) => {
    const[ searchParams, setSearchParms] = useSearchParams()
    const [query, setQuery] =useState("")

    useEffect(()=>{
      if(!isSearchOpen)return;
      
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
          isSearchOpen && (
            <div>

            </div>
          )
        }

      </div>
    );
}

export default Search