import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './NavBar'
import RegisterUser from './AuthenticationComponents/RegisterUser'
import VerifyEmail from './AuthenticationComponents/VerifyEmail'
import Login from './AuthenticationComponents/Login'

const App = () => {
  return (
    <>
    <NavBar/>
    <div className=' '>
        <Routes>
          <Route path='/register-user' element={<RegisterUser/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
    </div>
    </>
    
  )
}

export default App