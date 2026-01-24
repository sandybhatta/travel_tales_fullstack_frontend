import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EditTripModal from './EditTripModal';
import InviteTripModal from './InviteTripModal';
import mainApi from '../../Apis/axios';

const TripCover = ({
  trip,
  showEditModal,
  setShowEditModal,
  handleLike,
  setShowLikedUsersModal,
  formatDate,
  onTripUpdate
}) => {
  const navigate = useNavigate();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);

  // Redux state for current user
  const { user: currentUser } = useSelector((state) => state.user);

  // Local state for like
  const [isLiked, setIsLiked] = useState(trip?.currentUser?.isLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(trip?.totalLikes || 0);

  useEffect(() => {
    setIsLiked(trip?.currentUser?.isLiked);
    setLikeCount(trip?.totalLikes || 0);
  }, [trip]);

  // Determine permissions based on Redux state and trip data
  const isOwner = currentUser?._id && (
      (trip?.user?._id === currentUser._id) || 
      (trip?.user === currentUser._id)
  );

  // Check if user is a collaborator
  // Collaborators can be an array of objects (populated) or IDs
  const isCollaborator = trip?.collaborators?.some(c => 
      (c._id === currentUser?._id) || (c === currentUser?._id)
  );

  const canInvite = isOwner || isCollaborator;
  
  // Show the menu if user is owner or collaborator
  const showMenu = isOwner || isCollaborator;

  const handleDeleteTrip = async () => {
    // Immediate navigation back
    navigate(-1);
    
    try {
      await mainApi.delete(`/api/trips/${trip._id}/archive`);
    } catch (error) {
      console.error("Failed to archive trip", error);
    }
  };

  const handleLocalLike = async () => {
    if (isLiking) return;

    // Optimistic Update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    
    setIsLiking(true);
    setIsLiked(!previousLiked);
    setLikeCount(prev => previousLiked ? prev - 1 : prev + 1);

    try {
       await mainApi.post(`/api/trips/${trip._id}/like`);
       if(onTripUpdate) onTripUpdate(); 
    } catch (error) {
       console.error("Like failed", error);
       // Rollback
       setIsLiked(previousLiked);
       setLikeCount(previousCount);
    } finally {
       setIsLiking(false);
    }
  };

  return (
    <>
      {isEditFormOpen && (
        <EditTripModal 
            trip={trip} 
            onClose={() => setIsEditFormOpen(false)} 
            onUpdate={onTripUpdate} 
        />
      )}
      {isInviteFormOpen && (
        <InviteTripModal 
            trip={trip} 
            onClose={() => setIsInviteFormOpen(false)} 
            onUpdate={onTripUpdate}
        />
      )}
      {trip?.coverPhoto?.url ? (
        <div className="h-[60vh] w-full relative shadow-2xl">
          <img
            src={trip.coverPhoto.url}
            alt="Trip Cover"
            className="w-full h-full object-cover rounded-lg"
          />

          {showMenu && (
            <div
              className="absolute top-5 right-5 bg-black/40 p-3 cursor-pointer rounded-lg flex items-center justify-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal((prev) => !prev);
              }}
            >
              {!showEditModal && (
                <i className="bx bx-dots-vertical text-3xl text-white p-1 "></i>
              )}
              {showEditModal && (
                <div className="px-3 py-1 relative rounded-lg flex flex-col items-start justify-evenly gap-1 ">
                  <i
                    className="absolute top-1 right-1 bx bx-x text-3xl text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal(false);
                    }}
                  ></i>

                  {isOwner && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditFormOpen(true);
                        setShowEditModal(false);
                      }}
                    >
                      <i className="bx bx-edit text-2xl "></i>
                      <span>Edit Trip</span>
                    </p>
                  )}
                  {canInvite && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInviteFormOpen(true);
                        setShowEditModal(false);
                      }}
                    >
                      <i className="bx bx-user-plus text-2xl "></i>
                      <span>Invite Trip</span>
                    </p>
                  )}
                  {isOwner && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip();
                      }}
                    >
                      <i className="bx bx-trash text-2xl "></i>
                      <span>Delete Trip</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="w-full absolute bottom-5 left-5 flex flex-col items-start justify-evenly gap-2">
            <h2 className="w-[80%] truncate font-semibold text-3xl text-white">
              {trip.title}
            </h2>

            {/* trip engagement info */}
            <div className="flex items-center justify-evenly gap-5">
              <p className="text-white flex items-center justify-around gap-2 ">
                <i className="bx bx-calendar-week text-3xl text-white"></i>
                <span className="text-xl">
                  {formatDate(trip.startDate)} -{" "}
                  {formatDate(trip.endDate)}
                </span>
              </p>
              {/* like */}
              <div onClick={handleLocalLike} className="cursor-pointer transition-transform active:scale-90">
                {isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#EF233C"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.995 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
             5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.495 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.545 11.54l-1.46 1.31z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.995 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
             5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.495 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.545 11.54l-1.46 1.31z"
                    />
                  </svg>
                )}
              </div>

              <button 
                  className="text-white text-xl font-semibold cursor-pointer hover:bg-black/40 hover:underline bg-transparent border-none"
                  onClick={(e)=>{
                    e.stopPropagation()
                    setShowLikedUsersModal(true)
                  }}
              >
                {likeCount} Likes
              </button>

              {/* comment */}
              <div className=" flex items-center justify-around gap-5">
                <i className="bx bx-message-circle-image text-white text-3xl"></i>
                <p className="text-white text-xl font-semibold">
                  {trip.totalComments} Comments{" "}
                </p>
              </div>
            </div>

            {/* tags */}
            <div className="w-4/5">
              {trip.tags && trip.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-around w-full">
                  {trip.tags.map((tag, index) => {
                    return (
                      <Link
                        to={`/trips/tag/${tag}`}
                        key={index}
                        className="px-3 py-1 bg-[#EF233C] text-white rounded-lg  text-sm font-semibold hover:bg-[#D90429] transition-colors"
                      >
                        #{tag}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full px-5 py-3 bg-white rounded-lg relative ">
          {showMenu && (
            <div
              className="absolute top-5 right-5 bg-black/40 p-3 cursor-pointer rounded-lg flex items-center justify-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal((prev) => !prev);
              }}
            >
              {!showEditModal && (
                <i className="bx bx-dots-vertical text-3xl text-white p-1 "></i>
              )}
              {showEditModal && (
                <div className="px-3 py-1 relative rounded-lg flex flex-col items-start justify-evenly gap-1 ">
                  <i
                    className="absolute top-1 right-1 bx bx-x text-3xl text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal(false);
                    }}
                  ></i>

                  {isOwner && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditFormOpen(true);
                        setShowEditModal(false);
                      }}
                    >
                      <i className="bx bx-edit text-2xl "></i>
                      <span>Edit Trip</span>
                    </p>
                  )}
                  {canInvite && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInviteFormOpen(true);
                        setShowEditModal(false);
                      }}
                    >
                      <i className="bx bx-user-plus text-2xl "></i>
                      <span>Invite Trip</span>
                    </p>
                  )}
                  {isOwner && (
                    <p 
                      className="mr-5 text-white font-semibold  hover:bg-[#EF233C] px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip();
                      }}
                    >
                      <i className="bx bx-trash text-2xl "></i>
                      <span>Delete Trip</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="w-full mt-20 flex flex-col items-start justify-evenly gap-2">
            <h2 className="w-[80%] truncate font-semibold text-3xl text-white">
              {trip.title}
            </h2>

            {/* trip engagement info */}
            <div className="flex items-center justify-evenly gap-5">
              <p className="text-white flex items-center justify-around gap-2 ">
                <i className="bx bx-calendar-week text-3xl text-white"></i>
                <span className="text-xl">
                  {formatDate(trip.startDate)} -{" "}
                  {formatDate(trip.endDate)}
                </span>
              </p>
              {/* like */}
              <div onClick={handleLocalLike} className="cursor-pointer transition-transform active:scale-90">
                {isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#EF233C"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.995 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
             5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.495 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.545 11.54l-1.46 1.31z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.995 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
             5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.495 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.545 11.54l-1.46 1.31z"
                    />
                  </svg>
                )}
              </div>

              <button 
                  className="text-white text-xl font-semibold cursor-pointer hover:bg-black/40 hover:underline bg-transparent border-none"
                  onClick={(e)=>{
                    e.stopPropagation()
                    setShowLikedUsersModal(true)
                  }}
              >
                {likeCount} Likes
              </button>

              {/* comment */}
              <div className=" flex items-center justify-around gap-5">
                <i className="bx bx-message-circle-image text-white text-3xl"></i>
                <p className="text-white text-xl font-semibold">
                  {trip.totalComments} Comments{" "}
                </p>
              </div>
            </div>

            {/* tags */}
            <div>
              {trip.tags && trip.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-around w-full">
                  {trip.tags.map((tag, index) => {
                    return (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#EF233C] text-white rounded-lg  text-sm font-semibold"
                      >
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripCover;
