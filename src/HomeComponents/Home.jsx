import React, { useEffect, useState } from 'react'
import NavComponent from './NavComponent'
import { useSelector,useDispatch } from 'react-redux'
import {loadUserFromStorage} from '../slices/userSlice'
import HomeFeed from './HomeFeed'
import SideBar from './SideBar'
import TripRelatedData from './TripRelatedData'




const Home = () => {
const [isSearchOpen,setIsSearchOpen] =useState(false)
const [createModal, setCreateModal] = useState(false)
  const dispatch = useDispatch()

const userState =useSelector(state=>state.user)
const isStateIncomplete = !userState.accessToken || !userState.username || !userState.email;


  useEffect(()=>{
    if (isStateIncomplete) {
      dispatch(loadUserFromStorage())
    }

  },[userState,dispatch])
  

  
  return (
    <div className=' w-full h-[400vh] bg-[#8D99AE]/60'
    onClick={()=>{
      setIsSearchOpen(false)
      setCreateModal(false)
    }}
    >
      <NavComponent isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>
      
      <div className='w-full flex  h-[calc(100vh -80px)] justify-between gap-20'>
        <SideBar/>
         <HomeFeed createModal={createModal} setCreateModal={setCreateModal}/>
         <TripRelatedData/>


      </div>
     
      
      </div>
  )
}

export default Home