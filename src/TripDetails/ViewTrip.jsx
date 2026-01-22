import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import mainApi from "../Apis/axios";

import ViewNoteTrip from "./components/ViewNoteTrip";
import ViewTodoTrip from "./components/ViewTodoTrip";
import PostsOfTrip from "./components/PostsOfTrip";

// Import modular components
import TripRemovalModals from "./components/TripRemovalModals";
import TripCover from "./components/TripCover";
import TripCollaborators from "./components/TripCollaborators";
import TripDescription from "./components/TripDescription";
import TripDestinations from "./components/TripDestinations";
import TripExpenses from "./components/TripExpenses";
import TripStats from "./components/TripStats";

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

  const [confirmCollaboratorRemoval, setConfirmCollaboratorRemoval] = useState({
    confirm: false,
    userId: null,
  });

  const [confirmInvitedRemoval, setConfirmInvitedRemoval] = useState({
    confirm: false,
    userId: null,
  });

  const [invitedUsers, setInvitedUsers] = useState([]);

  const [trip, setTrip] = useState(null);

  const[showTripStats , setShowTripStats] = useState(false)

  const [showDescription, setShowDescription] = useState(false);

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

  const handleRemoveCollaborator = async (userId) => {
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
  };

  const handleRemoveInviteds = async (userId) => {
    setError("");

    try {
      const result = await mainApi.delete(
        `/api/trips/${tripId}/invited/${userId}`
      );
      setInvitedUsers((prev) => prev.filter((friend) => friend._id !== userId));
    } catch (error) {
      setError(error?.response?.data?.message || "Internal Server Error");
    }
  };



  useEffect(()=>{

    const fetchLikesOfTheTrip = async()=>{
      try {
        setError("")
        const response = await mainApi.get(`/api/trips/${tripId}/likes`)
        setLikedUsers({
          totalLikes:response.data.totalLikes,
          users:response.data.likes
        })

      } catch (error) {
        setError(error?.response?.data?.message || "Error while fetching likes of the")
      }
    }


    if(showLikedUsersModal){
      fetchLikesOfTheTrip()
    }

  },[showLikedUsersModal])






console.log(trip);


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

    if (trip?.currentUser.canAccessPrivateData) {
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

  return (
    <div
      className="w-full min-h-screen h-fit pb-8 grid grid-cols-[1fr_5fr_1fr] gap-4 bg-[#EDF2F4]"
      onClick={() => {
        setShowCollaboratorModal(false);
        setShowEditModal(false);
        setConfirmCollaboratorRemoval({
          confirm: false,
          userId: null,
        });
        setConfirmInvitedRemoval({
          confirm: false,
          userId: null,
        });
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

        <TripRemovalModals
            confirmCollaboratorRemoval={confirmCollaboratorRemoval}
            setConfirmCollaboratorRemoval={setConfirmCollaboratorRemoval}
            handleRemoveCollaborator={handleRemoveCollaborator}
            confirmInvitedRemoval={confirmInvitedRemoval}
            setConfirmInvitedRemoval={setConfirmInvitedRemoval}
            handleRemoveInviteds={handleRemoveInviteds}
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
            />

            <TripCollaborators
                trip={trip}
                showCollaboratorModal={showCollaboratorModal}
                setShowCollaboratorModal={setShowCollaboratorModal}
                activeCollaboratorPage={activeCollaboratorPage}
                setActiveCollaboratorPage={setActiveCollaboratorPage}
                invitedUsers={invitedUsers}
                setConfirmCollaboratorRemoval={setConfirmCollaboratorRemoval}
                setConfirmInvitedRemoval={setConfirmInvitedRemoval}
                formatAcceptedDate={formatAcceptedDate}
            />

            <TripDescription
                trip={trip}
                showDescription={showDescription}
                setShowDescription={setShowDescription}
            />

            <div
              className={` w-full grid ${
                trip.currentUser.canAccessPrivateData
                  ? "grid-cols-3"
                  : "grid-cols-2"
              } gap-5 px-5 py-5 `}
            >
              <TripDestinations trip={trip} />

              <TripExpenses
                  trip={trip}
                  organizedExpenses={organizedExpenses}
                  formatAcceptedDate={formatAcceptedDate}
              />

              <TripStats
                  trip={trip}
                  stats={stats}
                  showTripStats={showTripStats}
                  setShowTripStats={setShowTripStats}
              />
            </div>

            {/* notes and todo lists */}
            {trip.currentUser.canAccessPrivateData && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                <ViewNoteTrip trip={trip} setTrip={setTrip}/>
                <ViewTodoTrip trip={trip} setTrip={setTrip} />
              </div>
            )}

            <PostsOfTrip trip={trip} setTrip={setTrip} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTrip;
