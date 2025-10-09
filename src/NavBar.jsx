import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <div>
        <div>
          <Link to={"/register-user"}> Register </Link>
        </div>

    </div>
   
  )
}

export default NavBar