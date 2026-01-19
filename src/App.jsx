import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import RegisterUser from './AuthenticationComponents/RegisterUser'
import VerifyEmail from './AuthenticationComponents/VerifyEmail'
import Login from './AuthenticationComponents/Login'
import Home from './HomeComponents/Home'

import LandingPage from './LandingPage/LandingPage'
import MyTrips from './SideBarComponents/MyTrips'
import Collaborated from './SideBarComponents/Collaborated'
import BookMarkedPosts from './SideBarComponents/BookMarkedPosts'
import InvitedTrips from './SideBarComponents/InvitedTrips'
import AcceptedTrips from './SideBarComponents/AcceptedTrips'
import Explore from './SideBarComponents/Explore'
import HomeFeed from './HomeComponents/HomeFeed'
import Friends from './SideBarComponents/Friends'
import ProfilePage from './ProfileSection/ProfilePage'
import ViewTrip from './SideBarComponents/TripSection/ViewTrip'
import PostDetailsPage from './PostDetails/PostDetailsPage'

const App = () => {
  const [createModal, setCreateModal] = useState(false)
  return (
    <>
    
    <div className=' bg-[#EDF2F4]'>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          
          <Route path='/register-user' element={<RegisterUser/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/login" element={<Login/>}/>


          <Route path="/home" element={<Home />}>
            <Route index element={<HomeFeed createModal={createModal} setCreateModal={setCreateModal}/>} /> 
            <Route path="my-trips" element={<MyTrips />} />
            <Route path="collaborated-trips" element={<Collaborated />} />
            <Route path="bookmarked-posts" element={<BookMarkedPosts />} />
            <Route path="invited-trips" element={<InvitedTrips />} />
            <Route path="accepted-trips" element={<AcceptedTrips />} />
            <Route path="explore" element={<Explore />} />
            <Route path="friends" element={<Friends />} />
            
          </Route>
          <Route path='/trip/:tripId' element={<ViewTrip/>}/>
          <Route path='/post/:postId' element={<PostDetailsPage/>}/>
          <Route path='profile/:userId' element={<ProfilePage/>} />


        </Routes>
    </div>
    


    </>
    
  )
}

export default App