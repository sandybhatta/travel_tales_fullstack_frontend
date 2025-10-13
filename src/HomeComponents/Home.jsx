import React, { useEffect } from 'react'
import NavComponent from './NavComponent'
import { useSelector,useDispatch } from 'react-redux'
import {loadUserFromStorage} from '../slices/userSlice'




const Home = () => {

  const dispatch = useDispatch()

const userState =useSelector(state=>state.user)
const isStateIncomplete = !userState.accessToken || !userState.username || !userState.email;


  useEffect(()=>{
    if (isStateIncomplete) {
      dispatch(loadUserFromStorage())
    }

  },[userState,dispatch])
  

  
  return (
    <div className=' w-full h-[100vh] bg-green-100'>
      <NavComponent/>
      
      
      Home</div>
  )
}

export default Home