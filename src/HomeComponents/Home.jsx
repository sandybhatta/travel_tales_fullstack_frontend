import React, { useState } from "react";
import NavComponent from "./NavComponent";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

const Home = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
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
            fixed bottom-0 left-0 right-0 z-50 h-[70px] bg-[#2b2d42] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
            lg:fixed lg:top-[80px] lg:left-0 lg:bottom-0 lg:h-[calc(100vh-80px)] lg:bg-white lg:border-r lg:shadow-none
            lg:flex lg:flex-col lg:items-center
            ${isSidebarOpen ? "lg:w-64" : "lg:w-20"}
          `}
        >
          <SideBar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>

        {/* MAIN CONTENT */}
        <div 
          className={`
            flex-1 bg-[#edf2f4] pb-[70px] lg:pb-0 overflow-y-auto
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}
          `}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
