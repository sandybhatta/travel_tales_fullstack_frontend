import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './NavBar'
import RegisterUser from './AuthenticationComponents/RegisterUser'

const App = () => {
  return (
    <>
    <NavBar/>
    <div>
        <Routes>
          <Route path='/register-user' element={<RegisterUser/>}/>
        </Routes>
    </div>
    </>
    
  )
}

export default App