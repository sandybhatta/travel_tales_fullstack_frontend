import React from 'react'
import { useParams } from 'react-router-dom'

const ProfilePage = () => {
    const {userId} = useParams()
  return (
    <div>ProfilePage</div>
  )
}

export default ProfilePage