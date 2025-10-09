import React from 'react'
import { Route, Routes } from 'react-router-dom'

import RegisterUser from './AuthenticationComponents/RegisterUser'
import VerifyEmail from './AuthenticationComponents/VerifyEmail'
import Login from './AuthenticationComponents/Login'
import Home from './HomeComponents/Home'
import NavBar from './NavBar'
import LandingPage from './LandingPage'

const App = () => {
  
  return (
    <>
    
    <div className=' '>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path='/register-user' element={<RegisterUser/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
    </div>
    


    </>
    
  )
}

export default App