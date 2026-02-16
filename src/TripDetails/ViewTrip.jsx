import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTripByIdQuery,
  useToggleTripLikeMutation,
  useGetTripLikesQuery,
} from "../slices/tripApiSlice";
import { useFetchChatsQuery } from "../slices/chatApiSlice";

import ViewNoteTrip from "./components/ViewNoteTrip";
import ViewTodoTrip from "./components/ViewTodoTrip";
import PostsOfTrip from "./components/PostsOfTrip";
import ViewTripSkeleton from "./components/ViewTripSkeleton";

// Import modular components
import TripLikesModal from "./components/TripLikesModal";
import TripCover from "./components/TripCover";
import TripCollaborators from "./components/TripCollaborators";
import TripDescription from "./components/TripDescription";
import TripDestinations from "./components/TripDestinations";
import TripExpenses from "./components/TripExpenses";
import TripStats from "./components/TripStats";

const ViewTrip = () => {
  const { tripId } = useParams();
  
  const {
    data: tripData,
    isLoading,
    error: tripError,
    refetch,
  } = useGetTripByIdQuery(tripId);

  const navigate = useNavigate();
  
  const { data: allChats } = useFetchChatsQuery();
  const tripChat = allChats?.find(c => c.tripId === tripId || c.tripId?._id === tripId);
  const hasUnreadTripMessages = tripChat?.unreadCount > 0;

  const trip = tripData?.trip;

  const [showLikedUsersModal, setShowLikedUsersModal] = useState(false);
  
  const { data: likesData } = useGetTripLikesQuery(tripId, {
    skip: !showLikedUsersModal,
  });

  const [toggleTripLike] = useToggleTripLikeMutation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'expenses', 'notes', 'todos'
  const[showTripStats , setShowTripStats] = useState(false)
  const [showDescription, setShowDescription] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tripError) {
       setError(tripError?.data?.message || "Error loading trip");
    }
  }, [tripError]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = async () => {
    try {
      await toggleTripLike(tripId).unwrap();
    } catch (error) {
      setError(error?.data?.message || "Internal Server Error");
    }
  };

  function formatAcceptedDate(dateString) {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const organizedExpenses = useMemo(() => {
    if (!trip?.currentUser?.canAccessPrivateData) return null;
    if (!trip?.expenses || trip.expenses.length === 0) return null;

    const expensesByUser = {};

    trip.expenses.forEach((expense) => {
      const userId = expense.spentBy._id;

      if (!expensesByUser[userId]) {
        expensesByUser[userId] = {
          user: expense.spentBy,
          totalAmount: 0,
          expenses: [],
        };
      }

      expensesByUser[userId].totalAmount += expense.amount;
      expensesByUser[userId].expenses.push(expense);
    });

    return expensesByUser;
  }, [trip?.currentUser?.canAccessPrivateData, trip?.expenses]);

  const stats = useMemo(() => {
    const tripsStats = {
      ...trip?.engagement,

      highlightedPostCount: 0,
      totalExpense: 0,
      totalPinnedNotes: 0,
    };

    trip?.posts.forEach(({ post, isHighlighted }) => {
      
      if (isHighlighted) {
        tripsStats.highlightedPostCount += 1;
      }
    });
    tripsStats.isCollaborative = trip?.virtuals.isCollaborative;
    tripsStats.duration = trip?.virtuals.duration;
    tripsStats.tripStatus = trip?.virtuals.tripStatus;

    if (trip?.currentUser?.canAccessPrivateData) {
      tripsStats.travelBudget = trip.travelBudget;

      if (trip?.expenses && trip?.expenses.length > 0) {
        const totalExpense = trip.expenses.reduce(
          (acc, expense) => acc + expense.amount,
          0
        );
        tripsStats.totalExpense = totalExpense;
      }
      if (trip?.notes && trip?.notes.length > 0) {
        const totalPinnedNotes = trip.notes.reduce(
          (acc, note) => (note.isPinned ? acc + 1 : acc),
          0
        );
        tripsStats.totalPinnedNotes = totalPinnedNotes;
      }
      tripsStats.totalTasks = trip?.taskStats.totalTasks;
      tripsStats.completedTasks = trip?.taskStats.completedTasks;
    }

    return tripsStats;
  }, [trip]);
  
  if (isLoading) return <ViewTripSkeleton />;

  return (
    <div
      className="w-full min-h-screen h-fit pb-8 flex flex-col lg:grid lg:grid-cols-[1fr_5fr_1fr] gap-4 bg-[#EDF2F4] overflow-x-hidden"
      onClick={() => {
        setShowEditModal(false);
      }}
    >
      <div className="w-full px-2 md:px-4 lg:px-0 lg:col-start-2 lg:col-end-3 ">
        {error && (
          <p className="text-red-500 text-3xl font-semibold text-center">
            Error: {error}
          </p>
        )}

        <TripLikesModal 
            isOpen={showLikedUsersModal}
            onClose={() => setShowLikedUsersModal(false)}
            likedUsersData={likesData ? { totalLikes: likesData.totalLikes, users: likesData.likes } : { totalLikes: 0, users: [] }}
        />

        {trip && (
          <div className="w-full flex flex-col items-center justify-around gap-10 ">
            
            <TripCover
                trip={trip}
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                handleLike={handleLike}
                setShowLikedUsersModal={setShowLikedUsersModal}
                formatDate={formatDate}
                onTripUpdate={refetch}
            />

            <TripCollaborators
                trip={trip}
            />

            <TripDescription
                trip={trip}
                showDescription={showDescription}
                setShowDescription={setShowDescription}
            />

            {/* Main Content Grid */}
            <div className="w-full px-5 py-5 flex flex-col gap-8">
              
              {/* Top Row: Destinations + Stats */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">
                <TripDestinations trip={trip} />
                <TripStats
                    trip={trip}
                    stats={stats}
                    showTripStats={showTripStats}
                    setShowTripStats={setShowTripStats}
                />
              </div>

              {/* Interactive Boxes (Only for Owner/Collaborators) */}
              {trip.currentUser.canAccessPrivateData && (
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Expenses Box */}
                    <div 
                        onClick={() => setActiveModal('expenses')} 
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 cursor-pointer transition-all group flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors flex items-center justify-center">
                            <i className="bx bx-dollar-circle text-4xl text-red-500"></i>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">Expenses</h3>
                            <p className="text-gray-500 text-sm mt-1">Manage trip budget & costs</p>
                        </div>
                    </div>

                    {/* Notes Box */}
                    <div 
                        onClick={() => setActiveModal('notes')} 
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 cursor-pointer transition-all group flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors flex items-center justify-center">
                            <i className="bx bx-note text-4xl text-yellow-500"></i>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">Notes</h3>
                            <p className="text-gray-500 text-sm mt-1">Pinned info & memos</p>
                        </div>
                    </div>

                    {/* Todo List Box */}
                    <div 
                        onClick={() => setActiveModal('todos')} 
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 cursor-pointer transition-all group flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors flex items-center justify-center">
                            <i className="bx bx-check-square text-4xl text-blue-500"></i>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">Todo List</h3>
                            <p className="text-gray-500 text-sm mt-1">Tasks & assignments</p>
                        </div>
                    </div>

                    {/* Trip Chat Box */}
                    <div 
                        onClick={() => navigate('/chat', { state: { chatId: tripChat?._id } })} 
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 cursor-pointer transition-all group flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors flex items-center justify-center relative">
                            <i className="bx bx-message-circle-dots-2 text-4xl text-green-500"></i>
                             {hasUnreadTripMessages && (
                                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white">
                                    {tripChat.unreadCount > 99 ? '99+' : tripChat.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">Group Chat</h3>
                            <p className="text-gray-500 text-sm mt-1">Discuss & Plan</p>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Generic Modal for Expenses, Notes, Todos */}
            {activeModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                            <div className="flex items-center gap-3">
                                {activeModal === 'expenses' && <i className="bx bx-dollar-circle text-3xl text-red-500"></i>}
                                {activeModal === 'notes' && <i className="bx bx-note text-3xl text-yellow-500"></i>}
                                {activeModal === 'todos' && <i className="bx bx-check-square text-3xl text-blue-500"></i>}
                                <h3 className="text-2xl font-bold text-gray-800 capitalize">
                                    {activeModal === 'todos' ? 'Todo List' : activeModal}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <i className='bx bx-x text-3xl text-gray-500'></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto p-6 bg-[#EDF2F4] flex-1">
                            {activeModal === 'expenses' && (
                                <TripExpenses
                                    trip={trip}
                                    organizedExpenses={organizedExpenses}
                                    formatAcceptedDate={formatAcceptedDate}
                                    onTripUpdate={refetch}
                                    isModal={true}
                                />
                            )}
                            {activeModal === 'notes' && (
                                <ViewNoteTrip 
                                    trip={trip} 
                                    setTrip={() => {}} // Read-only or handled by refetch
                                    onTripUpdate={refetch}
                                    isModal={true}
                                />
                            )}
                            {activeModal === 'todos' && (
                                <ViewTodoTrip 
                                    trip={trip} 
                                    setTrip={() => {}} 
                                    onTripUpdate={refetch}
                                    isModal={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <PostsOfTrip trip={trip} setTrip={() => {}} onTripUpdate={refetch} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTrip;
