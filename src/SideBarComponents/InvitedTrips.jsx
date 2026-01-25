import React, { useEffect, useState } from "react";
import mainApi from "../Apis/axios";
import PendingInvitedTrips from "./TripSection/PendingInvitedTrips";
import AcceptedInvitedTrips from "./TripSection/AcceptedInvitedTrips";
import AllInvitedTrips from "./TripSection/AllInvitedTrips";

const InvitedTrips = () => {
  const [invitedTrips, setInvitedTrips] = useState([]);
  const [acceptedTrips, setAcceptedTrips] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Default to true for initial load

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [dropdownOpen, setDropDownOpen] = useState(false);

  const [activePage, setActivePage] = useState("pending");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchInvitedTrips = async () => {
      setError("")
      setLoading(true);
      try {
        if (activePage === "pending") {
          const response = await mainApi.get("/api/user/invited-trips", {
            signal,
          });

          setInvitedTrips(
            Array.isArray(response.data?.trips) ? response.data.trips : []
          );
        } else if (activePage === "accepted") {
          const response = await mainApi.get("/api/user/accepted-trips", {
            signal,
          });

          setAcceptedTrips(
            Array.isArray(response.data?.trips) ? response.data.trips : []
          );
        }
      } catch (error) {
        if (error.name === "CanceledError") return;

        if (error?.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.code === "ERR_NETWORK") {
          setError("Network connection is unstable");
        } else {
          setError("Something went wrong");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInvitedTrips();

    return () => controller.abort();
  }, [activePage]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center pb-10"
      onClick={() => {
        setSearchOpen(false);
        setDropDownOpen(false);
      }}
    >
      {/* Sticky Header for Navigation */}
      <div className='sticky top-[80px] z-10 bg-gray-900/95 backdrop-blur-sm w-full border-b border-gray-800 mb-8'>
        <div className='flex justify-center items-center max-w-6xl mx-auto py-4 px-4'>
            <div className='flex w-full md:w-auto p-1 gap-2 bg-gray-800 rounded-full'>
                <button
                    onClick={() => setActivePage("pending")}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activePage === "pending"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <i className='bx bx-envelope'></i>
                        <span>Pending ({invitedTrips.length})</span>
                    </div>
                </button>

                <button
                    onClick={() => setActivePage("accepted")}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activePage === "accepted"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <i className='bx bx-check-circle'></i>
                        <span>Accepted ({acceptedTrips.length})</span>
                    </div>
                </button>

                <button
                    onClick={() => setActivePage("all")}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activePage === "all"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                >
                    <span>All</span>
                </button>
            </div>
        </div>
      </div>

      <div className="w-[90%] max-w-6xl flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              Invited Trips
            </h2>
            <p className="text-gray-400">
              Manage trip invitations from your friends and family
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700 placeholder-gray-500"
                  placeholder="Search trips..."
                />
             </div>

             <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setDropDownOpen(!dropdownOpen);
                    }}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                >
                    <i className="bx bx-slider"></i>
                    <span className="hidden md:inline">{sortBy ? `Sort: ${sortBy}` : "Sort"}</span>
                    <i className="bx bx-chevron-down"></i>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20 overflow-hidden">
                        {["Latest", "Oldest", "Popular"].map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    setSortBy(option.toLowerCase() === "latest" ? "" : option.toLowerCase());
                                    setDropDownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex justify-between items-center"
                            >
                                {option}
                                {((sortBy === "" && option === "Latest") || sortBy === option.toLowerCase()) && (
                                    <i className="bx bx-check text-red-500"></i>
                                )}
                            </button>
                        ))}
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Notifications */}
        {invitedTrips.length > 0 && activePage === "pending" && (
          <div className="w-full flex items-center gap-4 bg-red-500/10 border border-red-500/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="p-2 bg-red-500/20 rounded-full">
                <i className="bx bx-bell text-2xl text-red-500"></i>
            </div>
            <div>
              <p className="text-white font-medium">
                You have {invitedTrips.length} pending invitation{invitedTrips.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-400">
                Review them below to start your next adventure!
              </p>
            </div>
          </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center">
                {error}
            </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
            {activePage === "pending" ? (
            <PendingInvitedTrips
                invitedTrips={invitedTrips}
                setInvitedTrips={setInvitedTrips}
                formatDate={formatDate}
                setError={setError}
                loading={loading}
            />
            ) : activePage === "accepted" ? (
            <AcceptedInvitedTrips 
                acceptedTrips={acceptedTrips}
                formatDate={formatDate}
                loading={loading}
            />
            ) : (
            <AllInvitedTrips loading={loading} />
            )}
        </div>
      </div>
    </div>
  );
};

export default InvitedTrips;