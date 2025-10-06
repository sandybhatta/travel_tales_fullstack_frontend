import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './NavBar'
import RegisterUser from './AuthenticationComponents/RegisterUser'
import VerifyEmail from './AuthenticationComponents/VerifyEmail'

const App = () => {
  return (
    <>
    <NavBar/>
    <div>
        <Routes>
          <Route path='/register-user' element={<RegisterUser/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          {/* /verify-email?token */}
        </Routes>
    </div>
    </>
    
  )
}

export default App