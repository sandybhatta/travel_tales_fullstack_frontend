import React, { useEffect } from 'react'

import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'




const LandingPage = () => {
    
    const navigate =useNavigate()

    useEffect(()=>{
        const isAccessToken= useSelector(state=>state.user.isAccessToken)

        if(isAccessToken){
            navigate('/home')
        }   
     },[])

  return (
    <div>
        <div>
            Landing
            
        </div>
        


    </div>
  )
}

export default LandingPage