import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserFromStorage } from './slices/userSlice'

import RegisterUser from './AuthenticationComponents/RegisterUser'
import VerifyEmail from './AuthenticationComponents/VerifyEmail'
import VerifyEmailChange from './AuthenticationComponents/VerifyEmailChange'
import Login from './AuthenticationComponents/Login'
import Home from './HomeComponents/Home'
import SearchResultsPage from './HomeComponents/SearchResultsPage'

import LandingPage from './LandingPage/LandingPage'
import InvitedTrips from './SideBarComponents/InvitedTrips'
import HomeFeed from './HomeComponents/HomeFeed'
import Friends from './SideBarComponents/Friends'
import TaggedPosts from './SideBarComponents/TaggedPosts'
import MentionedPosts from './SideBarComponents/MentionedPosts'
import Comments from './SideBarComponents/Comments'
import ProfilePage from './ProfileSection/ProfilePage'
import ViewTrip from './TripDetails/ViewTrip'
import TaggedTripsPage from './TripDetails/TaggedTripsPage'
import PostDetailsPage from './PostDetails/PostDetailsPage'
import SharePostPage from './PostDetails/SharePostPage'
import Notifications from './HomeComponents/Notifications'
import ChatPage from './ChatComponents/ChatPage'

const App = () => {
  const [createModal, setCreateModal] = useState(false)
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  
  useEffect(() => {
    if (!userState.accessToken || !userState.username || !userState.email) {
      dispatch(loadUserFromStorage());
    }
  }, [userState, dispatch]);

  return (
    <>
    
    <div className=' bg-[#EDF2F4]'>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          
          <Route path='/register-user' element={<RegisterUser/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/verify-email-change" element={<VerifyEmailChange/>}/>
          <Route path="/login" element={<Login/>}/>


          <Route path="/home" element={<Home />}>
            <Route index element={<HomeFeed createModal={createModal} setCreateModal={setCreateModal}/>} /> 
            <Route path="invited-trips" element={<InvitedTrips />} />
            <Route path="friends" element={<Friends />} />
            <Route path="tagged-posts" element={<TaggedPosts />} />
            <Route path="mentioned-posts" element={<MentionedPosts />} />
            <Route path="comments" element={<Comments />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="notifications" element={<Notifications />} />
            
          </Route>
          <Route path='/trip/:tripId' element={<ViewTrip/>}/>
          <Route path='/trips/tag/:tagname' element={<TaggedTripsPage/>}/>
          <Route path='/post/:postId' element={<PostDetailsPage/>}/>
          <Route path='/post/share/:postId' element={<SharePostPage/>}/>
          <Route path='profile/:userId' element={<ProfilePage/>} />
          <Route path='/chat' element={<ChatPage />} />


        </Routes>
    </div>
    


    </>
    
  )
}

export default App