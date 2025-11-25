import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import mainApi from "../Apis/axios";
import AllTrips from "./TripSection/AllTrips";
import UpcomingTrips from "./TripSection/UpcomingTrips";
import OngoingTrips from "./TripSection/OngoingTrips";
import PastTrips from "./TripSection/PastTrips";

const MyTrips = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Start Date");
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [activePage, setActivePage] = useState("own-trip");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [upcomingTripNo, setUpcomingTripNo] = useState("0");
  const [upcomingTrips, setUpcomingTrips] = useState("");

  const [ongoingTripNo, setOnGoingTripNo] = useState("0");
  const [ongoingTrips, setOnGoingTrips] = useState("");

  const [completedTripNo, setCompletedTripNo] = useState("0");
  const [completedTrips, setCompletedTrips] = useState("");

  const [allTripNo, setAllTripNo] = useState("0");
  const [allTrips, setAllTrips] = useState(null);

  const _id = useSelector((state) => state.user._id);
  console.log(_id);

  useEffect(() => {
    const controller = new AbortController();  
        const signal = controller.signal;
  
    const fetchTrips = async () => {
      try {
        setLoading(true);
  
        const [ownTrips, upcomingTrip, onGoingTrip, completedTrip] =
          await Promise.all([
            mainApi.get(`/api/trips/${_id}/own-trip`, { signal }),
            mainApi.get("/api/trips/status/upcoming", { signal }),
            mainApi.get("/api/trips/status/ongoing", { signal }),
            mainApi.get("/api/trips/status/past", { signal }),
          ]);
  
        setLoading(false);
  
        const isNoTrips = !!ownTrips.data.message;
  
        setAllTrips(isNoTrips ? [] : ownTrips.data.trips);
        setAllTripNo(isNoTrips ? 0 : ownTrips.data.count);
  
        setUpcomingTrips(upcomingTrip.data.upcomingTrips);
        setUpcomingTripNo(upcomingTrip.data.count);
  
        setOnGoingTrips(onGoingTrip.data.onGoingTrips);
        setOnGoingTripNo(onGoingTrip.data.count);
  
        setCompletedTrips(completedTrip.data.pastTrips);
        setCompletedTripNo(completedTrip.data.count);
  
      } catch (err) {
        if (err.name === "CanceledError") {
          console.log("Request cancelled");
          return; // do NOT set error if user caused abort
        }
        setLoading(false);
        if (err.response) {
          setError(err.response.data.message);
        } else {
          setError("Network Error");
        }
      }
    };
  
    fetchTrips();
  
    return () => {
      controller.abort(); 
    };
  }, [_id]);
  

  return (
    <div
      className="bg-[#EDF2F4] w-full h-auto min-h-screen flex flex-col items-center  py-10 gap-10"
      onClick={() => {
        setSearchOpen(false);
      }}
    >
      {/* headers and intro */}
      <div className="w-[80%] flex  items-center justify-between ">
        {/* text info */}
        <div className="w-fit flex flex-col items-start justify-start ">
          <h2 className="text-black text-3xl font-semibold mb-3">My Trips</h2>
          <p className="text-gray-500 text-base">
            Plan, track, and share your travel adventures
          </p>
        </div>

        {/* create trip */}
        <div className="bg-red-500 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2">
          <i className="bx bx-plus  text-xl"></i>
          <p>Create New Trip</p>
        </div>
      </div>

      {/* search bar and option */}
      <div className="w-[80%] flex  items-center justify-between ">
        <div
          className={`w-[70%] bg-white rounded-lg shadow-lg ${
            searchOpen ? "border-3 border-red-500  " : "border-none"
          } flex items-center justify-start gap-2 px-4 py-2 `}
          onClick={(e) => {
            e.stopPropagation();
            setSearchOpen(true);
          }}
        >
          <i className="bx bx-search text-xl text-gray-500"></i>
          <input
            value={search}
            className="w-full text-xl text-black focus:outline-none border-none"
            placeholder="Search trips..."
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="w-[20%] flex flex-col items-center gap-2 justify-center text-base text-black z-20">
          <div
            className="relative shadow-2xl bg-white text-xl text-black flex items-center gap-3 justify-between px-2 py-2 rounded-lg w-full cursor-pointer"
            onClick={() => setDropDownOpen((prev) => !prev)}
          >
            <i className="bx bx-slider text-xl text-black"></i>
            <p className="text-sm ">
              Sort By {sortBy}
            </p>
            <i className="bx bx-chevron-down text-2xl text-gray-500"></i>
          </div>
          
          <div className="px-3 relative w-full ">
            {dropdownOpen && (
              <div className="w-full absolute top-0 left-1/2 -translate-x-1/2 bg-white flex flex-col items-center justify-center gap-3 px-3 py-2  rounded-lg shadow-2xl ">
                <p
                  className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                  onClick={() => {
                    setDropDownOpen(false);
                    setSortBy("Start Date");
                  }}
                >
                  Sort By Start Date
                  {sortBy === "Start Date" && (
                    <i className="bx bx-check text-gray-500 ml-2"></i>
                  )}
                </p>
                <p
                  className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                  onClick={() => {
                    setDropDownOpen(false);
                    setSortBy("End Date");
                  }}
                >
                  Sort By End Date
                  {sortBy === "End Date" && (
                    <i className="bx bx-check text-gray-500 ml-2"></i>
                  )}
                </p>
                <p
                  className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                  onClick={() => {
                    setDropDownOpen(false);
                    setSortBy("Destinations");
                  }}
                >
                  Sort By Destinations
                  {sortBy === "Destinations" && (
                    <i className="bx bx-check text-gray-500 ml-2"></i>
                  )}
                </p>
                <p
                  className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                  onClick={() => {
                    setDropDownOpen(false);
                    setSortBy("Posts");
                  }}
                >
                  Sort By Posts
                  {sortBy === "Posts" && (
                    <i className="bx bx-check text-gray-500 ml-2"></i>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User trips with status */}
      <div className="w-[80%] relative mb-10 ">
        <div className="w-fit absolute left-0 flex items-center justify-center gap-4 bg-white px-3 py-1 rounded-xl shadow-2xl">
          <p
            className={`${
              activePage === "own-trip"
                ? "bg-red-500 text-white"
                : "bg-transparent"
            } px-2 py-1 rounded-full cursor-pointer`}
            onClick={() => setActivePage("own-trip")}
          >
            All Trips ({allTripNo}){" "}
          </p>

          <p
            className={`${
              activePage === "upcoming"
                ? "bg-red-500 text-white"
                : "bg-transparent"
            } px-2 py-1 rounded-full cursor-pointer`}
            onClick={() => setActivePage("upcoming")}
          >
            Upcoming ({upcomingTripNo}){" "}
          </p>
          <p
            className={`${
              activePage === "ongoing"
                ? "bg-red-500 text-white"
                : "bg-transparent"
            } px-2 py-1 rounded-full cursor-pointer`}
            onClick={() => setActivePage("ongoing")}
          >
            Ongoing ({ongoingTripNo})
          </p>
          <p
            className={`${
              activePage === "past" ? "bg-red-500 text-white" : "bg-transparent"
            } px-2 py-1 rounded-full cursor-pointer`}
            onClick={() => setActivePage("past")}
          >
            Completed ({completedTripNo})
          </p>
        </div>
      </div>
            {
              error && <p>{error}</p>
            }
      {/* my trips */}
      <div className="w-[80%] ">
        {activePage === "own-trip" ? (
          <AllTrips allTrips={allTrips} sortBy={sortBy}/>
        ) : activePage === "upcoming" ? (
          <UpcomingTrips />
        ) : activePage === "ongoing" ? (
          <OngoingTrips />
        ) : (
          <PastTrips />
        )}
      </div>
    </div>
  );
};

export default MyTrips;
