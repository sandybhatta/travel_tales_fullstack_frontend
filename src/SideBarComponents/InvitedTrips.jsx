import React, { useEffect, useState } from "react";
import mainApi from "../Apis/axios";
import PendingInvitedTrips from "./TripSection/PendingInvitedTrips";
import AcceptedInvitedTrips from "./TripSection/AcceptedInvitedTrips";
import AllInvitedTrips from "./TripSection/AllInvitedTrips";

const InvitedTrips = () => {
  const [invitedTrips, setInvitedTrips] = useState([]);
  const [acceptedTrips, setAcceptedTrips] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [dropdownOpen, setDropDownOpen] = useState(false);

  const [activePage, setActivePage] = useState("pending");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchInvitedTrips = async () => {
      setLoading(true);
      try {
        if (activePage === "pending") {
          const response = await mainApi.get("/api/user/invited-trips", {
            signal,
          });

          setLoading(false);

          setInvitedTrips(
            Array.isArray(response.data?.trips) ? response.data.trips : []
          );
        } else if (activePage === "accepted") {
          const response = await mainApi.get("/api/user/accepted-trips", {
            signal,
          });

          setLoading(false);

          setAcceptedTrips(
            Array.isArray(response.data?.trips) ? response.data.trips : []
          );
        }
      } catch (error) {
        setLoading(false);

        if (error.name === "CanceledError") return;

        if (error?.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.code === "ERR_NETWORK") {
          setError("Network connection is bad");
        } else {
          setError("Something went wrong");
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
      className="w-full min-h-[calc(100vh-80px)] bg-[#EDF2F4] pt-10 flex flex-col items-center pb-10 "
      onClick={() => {
        setSearchOpen(false);
      }}
    >
      <div className="w-[80%] flex flex-col items-center gap-10 ">
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-black mb-3 font-semibold">
              {" "}
              Invited Trips{" "}
            </h2>
            <p className="text-base text-gray-500">
              Manage from your friends and family
            </p>
          </div>

          <div className="flex items-center justify-around gap-5 bg-white rounded-lg px-10 py-5 shadow-xl">
            <i className="bx bx-envelope-alt text-2xl text-red-500"></i>
            <div className="flex flex-col items-center justify-around">
              <p className="text-xl text-black">
                {" "}
                {invitedTrips.length} Pending{" "}
              </p>
              <p className="text-sm text-gray-500">invitations</p>
            </div>
          </div>
        </div>

        {/* notification that trips are pending */}
        {invitedTrips.length > 0 && (
          <div className="w-full flex items-center justify-start gap-5 bg-red-500/10 border-1 border-red-500 shadow-xl px-5 py-5 rounded-lg">
            <i className="bx bx-info-circle text-3xl text-red-500 "></i>
            <div className="flex flex-col gap-2">
              <p className="text-lg text-black ">
                {" "}
                You have {invitedTrips.length} pending Trip Invitations.
              </p>
              <p className="text-sm text-gray-500">
                Review and respond to invitations to start planning your next
                adventures !
              </p>
            </div>
          </div>
        )}

        {/* search and sort */}
        <div className="w-full flex  items-center justify-between ">
          <div
            className={`w-4/5 bg-white rounded-lg shadow-lg ${
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

          <div className="w-[18%] flex flex-col items-center gap-2 justify-center text-base text-black">
            <div
              className="relative bg-white text-xl text-black flex items-center gap-3 px-2 py-2 rounded-lg w-full cursor-pointer"
              onClick={() => setDropDownOpen((prev) => !prev)}
            >
              <i className="bx bx-slider text-xl text-black"></i>
              <p className="text-sm ">
                {sortBy ? `Sort By ${sortBy}` : "Sort By Latest"}
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
                      setSortBy("");
                    }}
                  >
                    Sort By Latest
                    {sortBy === "" && (
                      <i className="bx bx-check text-gray-500 ml-2"></i>
                    )}
                  </p>
                  <p
                    className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                    onClick={() => {
                      setDropDownOpen(false);
                      setSortBy("oldest");
                    }}
                  >
                    Sort By Oldest
                    {sortBy === "oldest" && (
                      <i className="bx bx-check text-gray-500 ml-2"></i>
                    )}
                  </p>
                  <p
                    className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                    onClick={() => {
                      setDropDownOpen(false);
                      setSortBy("popular");
                    }}
                  >
                    Sort By Popular
                    {sortBy === "popular" && (
                      <i className="bx bx-check text-gray-500 ml-2"></i>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* pagees */}

        <div className="w-full flex items-center justify-start">
          <div className="w-fit px-5 py-2 flex items-center justify-start gap-3 bg-white rounded-2xl">
            <div
              className={`${
                activePage === "pending" ? "bg-red-500" : "bg-transparent"
              } rounded-lg px-2 py-2 flex items-center justify-around gap-2 cursor-pointer`}
              onClick={() => setActivePage("pending")}
            >
              <i
                className={` bx bx-envelope ${
                  activePage === "pending" ? "text-white" : "text-black"
                } text-2xl`}
              ></i>
              <p
                className={`${
                  activePage === "pending" ? "text-white" : "text-black"
                } text-base`}
              >
                Pending ( {invitedTrips.length} )
              </p>
            </div>

            <div
              className={`${
                activePage === "accepted" ? "bg-red-500" : "bg-transparent"
              } rounded-lg px-2 py-2 flex items-center justify-around gap-2 cursor-pointer`}
              onClick={() => setActivePage("accepted")}
            >
              <i
                className={` bx bx-check-circle ${
                  activePage === "accepted" ? "text-white" : "text-black"
                } text-2xl`}
              ></i>
              <p
                className={`${
                  activePage === "accepted" ? "text-white" : "text-black"
                } text-base`}
              >
                Accepted ( {acceptedTrips.length} )
              </p>
            </div>

            <div
              className={`${
                activePage === "all" ? "bg-red-500" : "bg-transparent"
              } rounded-lg px-2 py-2 flex items-center justify-around gap-2 cursor-pointer`}
              onClick={() => setActivePage("all")}
            >
              <p
                className={`${
                  activePage === "all" ? "text-white" : "text-black"
                } text-base`}
              >
                All ( {invitedTrips.length + acceptedTrips.length} )
              </p>
            </div>
          </div>
        </div>

        {error && <div className="text-red-500">{error}</div>}
        {loading && <div>Loading...</div>}

        {activePage === "pending" ? (
          <PendingInvitedTrips
            invitedTrips={invitedTrips}
            setInvitedTrips={setInvitedTrips}
            formatDate={formatDate}
            setError={setError}
          />
        ) : activePage === "accepted" ? (
          <AcceptedInvitedTrips 
          acceptedTrips={acceptedTrips}
          formatDate={formatDate}
          />
        ) : (
          <AllInvitedTrips />
        )}
      </div>
    </div>
  );
};

export default InvitedTrips;
