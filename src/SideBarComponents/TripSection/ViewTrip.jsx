import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import mainApi from "../../Apis/axios";
import { set } from "mongoose";

const ViewTrip = () => {
  const { tripId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showLikedUsersModal, setShowLikedUsersModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [activeCollaboratorPage, setActiveCollaboratorPage] =
    useState("collaborators");

    const [confirmCollaboratorRemoval , setConfirmCollaboratorRemoval] = useState({
        confirm:false,
        userId:null
    })

    const [confirmInvitedRemoval , setConfirmInvitedRemoval] = useState({
        confirm:false,
        userId:null
    })

  const [invitedUsers, setInvitedUsers] = useState([]);

  const [trip, setTrip] = useState(null);




const [showDescription , setShowDescription] = useState(false);




  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = async () => {
    setError("");
    try {
      const result = await mainApi.post(`/api/trips/${tripId}/like`);
      setTrip((prevTrip) => ({
        ...prevTrip,
        currentUser: {
          ...prevTrip.currentUser,
          isLiked: result.data.liked,
        },

        totalLikes: result.data.likesCount,
      }));
    } catch (error) {
      setError(error?.response?.data?.message || "Internal Server Error");
    }
  };



  const handleRemoveCollaborator = async(userId)=>{
    setError("");
    try {
      const result = await mainApi.delete(
        `/api/trips/${tripId}/collaborators/${userId}`
      );

      setTrip((prevTrip) => ({
        ...prevTrip,
        acceptedFriends: prevTrip.acceptedFriends.filter(
          (friend) => friend.user._id !== userId
        ),
      }));
    } catch (error) {
      setError(error?.response?.data?.message || "Internal Server Error");
    }
  }

  const handleRemoveInviteds = async(userId)=>{

    setError("");

    try {
        const result = await mainApi.delete(`/api/trips/${tripId}/invited/${userId}`);
        setInvitedUsers((prev)=>prev.filter((friend)=>friend._id !== userId))
    } catch (error) {
        setError(error?.response?.data?.message || "Internal Server Error");
    }
  }



  useEffect(() => {
    const tripInfoFetch = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await mainApi.get(`/api/trips/${tripId}`);

        setTrip(response.data.trip);
      } catch (error) {
        if (error?.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.code === "ERR_NETWORK") {
          setError("Network connection is bad");
        }
      } finally {
        setLoading(false);
      }
    };
    tripInfoFetch();
  }, [tripId]);

  useEffect(() => {
    const fetchInviteds = async () => {
      try {
        setError("");
        const result = await mainApi.get(`/api/trips/${tripId}/invited`);
        setInvitedUsers(result.data.invitedFriends);
      } catch (error) {
        if (error?.response?.data?.message) {
          setError(error.response.data.message);
          
        } else if (error.code === "ERR_NETWORK") {
          setError("Network connection is bad");
        }
      }
    };
    if (activeCollaboratorPage === "inviteds") {
      fetchInviteds();
    }
  }, [activeCollaboratorPage]);

  function formatAcceptedDate(dateString) {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className="w-full min-h-screen grid grid-cols-[1fr_5fr_1fr] gap-4 bg-[#EDF2F4]"
      onClick={() => {
        setShowCollaboratorModal(false);
        setShowEditModal(false);
        setConfirmCollaboratorRemoval({
            confirm:false,
            userId:null
        })
        setConfirmInvitedRemoval({
            confirm:false,
            userId:null
        })
      }}
    >
      <div className="col-start-2 col-end-3 ">
        {loading && (
          <p className="font-semibold text-xl text-black">
            Loading trip details...
          </p>
        )}
        {error && (
          <p className="text-red-500 text-3xl font-semibold text-center">
            Error: {error}
          </p>
        )}


        {/* confirmation before removing the collaborators */}

            {
                confirmCollaboratorRemoval.confirm && 
                <div className="w-screen h-screen fixed top-0 left-0 bg-black/40 flex items-center justify-center z-40">
                    <div className="w-[40%] h-[30%] bg-white rounded-xl flex flex-col items-center justify-center gap-5 p-5 relative">


                        <i className="text-3xl bx bx-x text-red-500 font-bold p-2   absolute right-3 top-3 shadow-lg"
                        onClick={(e)=>{
                            e.stopPropagation();
                            setConfirmCollaboratorRemoval({
                                confirm:false,
                                userId:null
                            })
                        }}
                        ></i>

                        <p className="text-2xl font-semibold text-black">Are you Sure to remove this Collaborator</p>
                        <div className="w-full flex items-center justify-center gap-8 "
                        >

                            <p className="bg-red-500 text-white text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                            onClick={(e)=>{
                                e.stopPropagation()
                                handleRemoveCollaborator(confirmCollaboratorRemoval.userId)
                                setConfirmCollaboratorRemoval({
                                    confirm:false,
                                    userId:null
                                })
                            }}
                            >Yes</p>
                            <p className="bg-gray-400 text-black text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                        
                        onClick={(e)=>{
                            e.stopPropagation()
                            setConfirmCollaboratorRemoval({
                                confirm:false,
                                userId:null
                            })
                        }}>No</p>
                        </div>
                    </div>

                </div>
            }

            {/* confirmation before removing the inviteds */}

            {
                confirmInvitedRemoval.confirm && 
                <div className="w-screen h-screen fixed top-0 left-0 bg-black/40 flex items-center justify-center z-40">
                    <div className="w-[40%] h-[30%] bg-white rounded-xl flex flex-col items-center justify-center gap-5 p-5 relative">


                        <i className="text-3xl bx bx-x text-red-500 font-bold p-2   absolute right-3 top-3 shadow-lg"
                        onClick={(e)=>{
                            e.stopPropagation();
                            setConfirmInvitedRemoval({
                                confirm:false,
                                userId:null
                            })
                        }}
                        ></i>

                        <p className="text-2xl font-semibold text-black">Are you Sure to remove this Invited User</p>
                        <div className="w-full flex items-center justify-center gap-8 "
                        >

                            <p className="bg-red-500 text-white text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                            onClick={(e)=>{
                                e.stopPropagation()
                                handleRemoveInviteds(confirmCollaboratorRemoval.userId)
                                setConfirmInvitedRemoval({
                                    confirm:false,
                                    userId:null
                                })
                            }}
                            >Yes</p>
                            <p className="bg-gray-400 text-black text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                        
                        onClick={(e)=>{
                            e.stopPropagation()
                            setConfirmInvitedRemoval({
                                confirm:false,
                                userId:null
                            })
                        }}>No</p>
                        </div>
                    </div>

                </div>
            }




        {trip && (
          <div className="w-full flex flex-col items-center justify-around gap-10 ">
            {trip?.coverPhoto?.url ? (
              <div className="h-[60vh] w-full relative shadow-2xl">
                <img
                  src={trip.coverPhoto.url}
                  alt="Trip Cover"
                  className="w-full h-full object-cover rounded-lg"
                />

                {trip.currentUser.canEditTrip && (
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

                        {trip.currentUser.canEditTrip && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
                            <i className="bx bx-edit text-2xl "></i>
                            <span>Edit Trip</span>
                          </p>
                        )}
                        {trip.currentUser.canInviteFriends && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
                            <i className="bx bx-user-plus text-2xl "></i>
                            <span>Invite Trip</span>
                          </p>
                        )}
                        {trip.currentUser.canDeleteTrip && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
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
                    <div onClick={handleLike}>
                      {trip.currentUser.isLiked ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="red"
                          viewBox="0 0 24 24"
                          stroke="white"
                          className="w-7 h-7 cursor-pointer"
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
                          className="w-7 h-7 cursor-pointer"
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

                    <p className="text-white text-xl font-semibold">
                      {trip.totalLikes} Likes
                    </p>

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
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg  text-sm"
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
            ) : (
              <div className="w-full px-5 py-3 bg-white rounded-lg relative ">
                {trip.currentUser.canEditTrip && (
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

                        {trip.currentUser.canEditTrip && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
                            <i className="bx bx-edit text-2xl "></i>
                            <span>Edit Trip</span>
                          </p>
                        )}
                        {trip.currentUser.canInviteFriends && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
                            <i className="bx bx-user-plus text-2xl "></i>
                            <span>Invite Trip</span>
                          </p>
                        )}
                        {trip.currentUser.canDeleteTrip && (
                          <p className="mr-5 text-white font-semibold  hover:bg-red-500 px-2 py-1 rounded-lg text-base flex items-center justify-start gap-2">
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
                    <div onClick={handleLike}>
                      {trip.currentUser.isLiked ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="red"
                          viewBox="0 0 24 24"
                          stroke="white"
                          className="w-7 h-7 cursor-pointer"
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
                          className="w-7 h-7 cursor-pointer"
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

                    <p className="text-white text-xl font-semibold">
                      {trip.totalLikes} Likes
                    </p>

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
                              className="px-3 py-1 bg-red-500 text-white rounded-lg  text-sm font-semibold"
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

{/* -------------- Owner and collaborator info------------------------ */}
            <div className="w-full px-5 py-6 bg-white rounded-lg flex items-start justify-start gap-5">
              {/* owner */}
              <div className="h-15 w-[35%] flex items-center justify-center gap-2">
                <h2>Trip Owner :</h2>
                <img
                  src={trip.user.avatar?.url || trip.user.avatar}
                  alt="Owner Avatar"
                  className="h-full  rounded-full object-cover"
                />
                <div className="flex flex-col items-start justify-center gap-1">
                  <p className="text-base "> {trip.user.name}</p>
                  <p className="text-sm text-gray-500 ">
                    @{trip.user.username}
                  </p>
                </div>
              </div>

              <div className="bg-gray-500 shadow-2xl h-15 w-[2px] rounded-lg" ></div>

              {/* collaborators */}
              <div className="w-[60%] flex items-center justify-start gap-5 relative">
                {!showCollaboratorModal && <h2>Collaborators:</h2>}

                {/* see more */}
                {trip.acceptedFriends &&
                  trip.acceptedFriends.length > 0 &&
                  !showCollaboratorModal && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 right-2 flex  items-center justify-center gap-1 cursor-pointer px-3 py-1 bg-red-500 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCollaboratorModal((prev) => !prev);
                      }}
                    >
                      <p className="text-base text-white"> See More </p>
                      <i
                        className={` bx bx-caret-${
                          showCollaboratorModal ? "up" : "down"
                        } text-2xl text-white`}
                      ></i>
                    </div>
                  )}

                {/* collaborators in short form */}
                {!showCollaboratorModal && (
                  <div className="w-1/2 flex -space-x-3">
                    {trip.acceptedFriends && trip.acceptedFriends.length > 0 ? (
                      trip.acceptedFriends.slice(0, 5).map((friend) => (
                        <span
                          key={friend.id}
                          className="h-16 w-16  rounded-full border-2 border-white group relative"
                        >
                          <img
                            src={friend.user.avatar?.url || friend.user.avatar}
                            className="h-full object-cover rounded-full "
                          />

                          <span className="absolute bottom-0 translate-y-[100%] left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {friend.user.name}
                          </span>
                        </span>
                      ))
                    ) : trip.invitedFriends &&
                      trip.invitedFriends.length > 0 ? (
                      <p className="text-gray-500">
                        No collaborators joined yet.
                      </p>
                    ) : (
                      <p className="text-gray-500">
                        This is a Solo Trip. No friends have been invited.
                      </p>
                    )}
                  </div>
                )}

                {showCollaboratorModal && (
                  <div className="w-full flex flex-col items-start justify-start gap-2 shadow-2xl p-5 rounded-xl relative">

                    <i className="text-3xl bx bx-x text-red-500 font-bold p-2   absolute right-3 top-3 cursor-pointer"
                    onClick={()=>{
                        setShowCollaboratorModal(false);
                    }}
                    ></i>
                    {/* page to see colloborators or inviteds */}
                    <div className="flex items-center justify-start w-full gap-3">
                      <div
                        className={`px-3 cursor-pointer py-1 hover:shadow-2xl rounded-lg font-semibold ${
                          activeCollaboratorPage === "collaborators"
                            ? "bg-red-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCollaboratorPage("collaborators");
                        }}
                      >
                        Collaborators ({trip?.acceptedFriends?.length || 0})
                      </div>
                      {trip.currentUser.canAccessPrivateData && (
                        <div
                          className={`px-3 cursor-pointer py-1 hover:shadow-2xl rounded-lg font-semibold ${
                            activeCollaboratorPage === "inviteds"
                              ? "bg-red-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCollaboratorPage("inviteds");
                          }}
                        >
                          Invited Friends ({trip?.invitedFriends?.length || 0})
                        </div>
                      )}
                    </div>

                    {/* list of collborator */}

                    {activeCollaboratorPage === "collaborators" ? (
                      <div className="flex flex-col items-center justify-around gap-5">
                        {trip.acceptedFriends.map((friend) => (
                          <div
                            className="px-4 py-2 border rounded-lg shadow-lg"
                            key={friend._id}
                          >
                            <div className="flex flex-wrap items-center justify-start gap-3 ">
                              <img
                                src={
                                  friend.user.avatar?.url || friend.user.avatar
                                }
                                className="h-16 w-16 object-cover rounded-full "
                              />
                              <div className="flex flex-col items-start justify-center gap-1">
                                <p className="text-base ">
                                  {" "}
                                  {friend.user.name}
                                </p>
                                <p className="text-sm text-gray-500 ">
                                  @{friend.user.username}
                                </p>
                                <p className="text-sm text-gray-500 font-semibold">
                                  Accepted At :{" "}
                                  {formatAcceptedDate(friend.acceptedAt)}
                                </p>
                              </div>

                              {trip.currentUser.userStatus === "owner" && (
                                <div className="flex items-center justify-around gap-2 rounded-lg shadow-2xl bg-red-500 px-3 py-2 cursor-pointer"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    setConfirmCollaboratorRemoval({
                                        confirm:true,
                                        userId:friend.user._id
                                    })
                                }}
                                >
                                  <i className="bx bx-user-minus text-2xl text-white"></i>
                                  <p className="text-base font-semibold text-white">
                                    Remove
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-around gap-5">
                        {trip.invitedFriends &&
                          trip.invitedFriends.length === 0 && (
                            <p className="text-4xl font-semibold w-full text-black">
                              No Invited Friends{" "}
                            </p>
                          )}
                        {trip.invitedFriends &&
                          trip.invitedFriends.length > 0 && (
                            <div className="flex flex-col items-center justify-around gap-5">
                              {invitedUsers.map((friend) => (
                                <div
                                  className="px-4 py-2 border rounded-lg shadow-lg"
                                  key={friend._id}
                                >
                                  <div className="flex flex-wrap items-center justify-start gap-3 ">
                                    <img
                                      src={
                                        friend.avatar?.url ||
                                        friend.avatar
                                      }
                                      className="h-16 w-16 object-cover rounded-full "
                                    />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                      <p className="text-base ">
                                        {" "}
                                        {friend.name}
                                      </p>
                                      <p className="text-sm text-gray-500 ">
                                        @{friend.username}
                                      </p>
                                      
                                    </div>

                                    {trip.currentUser.userStatus ===
                                      "owner" && (
                                      <div className="flex items-center justify-around gap-2 rounded-lg shadow-2xl bg-red-500 px-3 py-2"
                                      onClick={(e)=>{
                                        e.stopPropagation();
                                        setConfirmInvitedRemoval({
                                            confirm:true,
                                            userId:friend._id
                                        })
                                      }}
                                      >
                                        <i className="bx bx-user-minus text-2xl text-white"></i>
                                        <p className="text-base font-semibold text-white">
                                          Remove 
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* description box */}
            <div className="w-full px-5 py-5 rounded-lg bg-white flex flex-col items-start jusitfy-center gap-5">
                <h2 className="text-2xl font-semibold text-black ">
                    Trip Description :
                </h2>
                <div className="w-full px-5 py-3  rounded-lg ">

                    {trip.description.length > 0 ?
                        <p className="text-base text-gray-700 whitespace-pre-wrap">
                            {showDescription ? 
                            trip.description :    trip.description.slice(0,150)
                        } <span className="text-red-500 font-semibold cursor-pointer text-lg"
                        onClick={(e)=>{
                            e.stopPropagation();
                            setShowDescription(prev=>!prev)
                        }}
                        >{showDescription ? "... See Less" :"... See More"} </span>
                        </p>:
                        <p>
                            No Description added for this trip.
                        </p>
                    }
                    
                </div>
            </div>


                    {/* trip destinations and trip stats for others and for owner and collaborators expenses too */}
            
                
                <div className={` w-full grid ${trip.currentUser.canAccessPrivateData ? "grid-cols-3":"grid-cols-2"} gap-5 px-5 py-5 `}>

                    {/* destinations */}
                    {trip.destinations && trip.destinations.length>0 && 
                    <div className="flex flex-col items-center justify-center gap-2 bg-white rounded-lg">
                            <div className="flex items-center justify-start gap-2">
                                <i className="bx bx-location text-2xl text-red-500"></i>
                                <p>Destinations</p>
                            </div>                

                            <div className="flex flex-col items-center justify-around gap-2">
                                {
                                    trip.destinations.map((destination)=>(
                                        <div
                                        key={destination._id}
                                        className="flex flex-col items-start justify-center gap-1 shadow-md w-full bg-[#EDF2F4] p-2"
                                        >
                                            <p className="text-lg text-black font-semibold">{destination.city}</p>
                                            <p className="text-base text-gray-600">{destination.state}, {destination.country}</p>
                                        </div>
                                    ))
                                }

                            </div>    
                    </div>}
                    {/* trip expenses*/}

                    {trip.currentUser.canAccessPrivateData && trip.expenses && trip.expenses.length>0 &&
                    <div className="flex flex-col items-center justify-center gap-2 w-full bg-white rounded-lg">
                    <div className="flex items-center justify-start gap-2">
                        <i className="bx bx-dollar-circle text-2xl text-red-500"></i>
                        <p>Expenses</p>
                    </div>                

                    <div className="flex flex-col items-center justify-around gap-2 ">
                        {
                            trip.expenses.map((expense)=>(
                                <div
                                key={expense._id}
                                className="flex  items-center justify-between gap-1 shadow-md w-full bg-[#EDF2F4] p-2 "
                                >
                                    <div className="flex flex-col items-start justify-around">
                                        {/* expense spentBy name username avatar  */}
                                        <div className="flex items-center justify-around gap-2">
                                            {/* avatar */}
                                            <div className="h-12 w-12 rounded-full border-2 border-white">
                                                <img
                                                src={expense.spentBy.avatar?.url || expense.spentBy.avatar}
                                                className="h-full object-cover"
                                                />
                                            </div>

                                            {/* name and username */}
                                            <div className="flex flex-col items-start justify-around gap-1">
                                                <p className="text-black text-lg ">{expense.spentBy.name}</p>
                                                <p className="text-gray-500 text-sm">@{expense.spentBy.username} </p>
                                                <p className="text-gray-500 text-sm font-semibold">{formatAcceptedDate(expense.createdAt)}</p>
                                            </div>
                                            
                                        </div>
                                        {/* expense title */}
                                        <p className="text-lg text-black font-semibold">{expense.title}</p>
                                        
                                    </div>
                                    
                                    <p className="text-lg text-black font-semibold flex items-center justify-center gap-1">
                                       <i className="bx bx-rupee text-red-500 text-xl"></i>
                                       <span> {expense.amount}</span>
                                        </p>
                                </div>
                            ))
                        }

                    </div>    
            </div>}
                </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTrip;
