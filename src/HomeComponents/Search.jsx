import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
const Search = () => {
    const[ searchParams, setSearchParms] = useSearchParams()
    const [query, setQuery] =useState("")

    
    
  return (
    <div className='w-[30%] h-[60%] relative flex items-center justify-center'>
        <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            className='w-full text-3xl block bg-[#ffffff]'
        />
        <i className='bx  bx-search absolute right-[1rem] top-[50%] -translate-y-[50%] text-4xl'  style={{color:'#EF233C'}} ></i> 

    </div>
  )
}

export default Search