import React, { useEffect, useState } from "react";
import NavComponent from "./NavComponent";
import { useSelector, useDispatch } from "react-redux";
import { loadUserFromStorage } from "../slices/userSlice";
import HomeFeed from "./HomeFeed";
import SideBar from "./SideBar";
import TripRelatedData from "./TripRelatedData";
import { Outlet } from "react-router-dom";

const Home = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useDispatch();

  const userState = useSelector((state) => state.user);
  const isStateIncomplete =
    !userState.accessToken || !userState.username || !userState.email;

  useEffect(() => {
    if (isStateIncomplete) {
      dispatch(loadUserFromStorage());
    }
  }, [userState, dispatch]);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      onClick={() => setIsSearchOpen(false)}
    >
      <NavComponent
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      {/* MAIN LAYOUT */}
      <div className="flex pt-[80px] flex-1">
        {/* SIDEBAR */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "w-64" : "w-20"}
            bg-white border-r
            flex flex-col items-center
          `}
        >
          <SideBar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#edf2f4]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
