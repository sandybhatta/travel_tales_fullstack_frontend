import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const reduxUserState = useSelector((state) => state.user);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = reduxUserState?._id || userInfo?._id;
  const avatar = reduxUserState?.avatar || userInfo?.avatar;
  const username = reduxUserState?.username || userInfo?.username;

  const links = [
    { name: "Home", path: "/home", icon: "bx-home-alt-2" },
    { name: "Profile", path: `/profile/${userId}`, icon: "bx-user" },
    { name: "Invited Trips", path: "invited-trips", icon: "bx-cursor-add" },
    { name: "Friends", path: "friends", icon: "bx-group" },
    { name: "Tagged Posts", path: "tagged-posts", icon: "bx-tag" },
    { name: "Mentioned Posts", path: "mentioned-posts", icon: "bx-at" },
    { name: "Mentioned Comments", path: "comments", icon: "bx-message-circle-reply" },
  ];

  return (
    <div className="w-full h-full bg-[#2b2d42] flex flex-col items-center relative shadow-xl transition-all duration-300">
      
      {/* Toggle Button */}
      <i
        className="bx bx-sidebar text-[#EDF2F4] px-2 py-3 text-3xl absolute right-2 top-2 cursor-pointer hover:text-[#EF233C] transition-colors"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* User Info (Mini Profile) */}
      <div className={`mt-16 mb-4 flex flex-col items-center transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
        <img 
          src={avatar} 
          alt="User" 
          className="w-16 h-16 rounded-full object-cover border-2 border-[#EF233C] shadow-lg mb-2"
        />
        <p className="text-[#EDF2F4] font-medium text-sm">@{username}</p>
      </div>

      {/* Links */}
      <div className={`w-full ${isSidebarOpen ? "mt-2" : "mt-20"} flex flex-col items-center gap-2`}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === "/home"}
            className={({ isActive }) =>
              `
              w-[90%] py-3 px-3 rounded-xl
              flex items-center
              ${isSidebarOpen ? "justify-start gap-4" : "justify-center"}
              text-[#EDF2F4] transition-all duration-300
              ${isActive ? "bg-[#EF233C] shadow-md scale-105" : "hover:bg-[#8D99AE]/20 hover:scale-105"}
              `
            }
          >
            <i className={`bx ${link.icon} text-2xl min-w-[24px]`} />

            {/* Text (only when open) */}
            <span
              className={`
                whitespace-nowrap font-medium text-sm tracking-wide transition-all duration-300
                ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
              `}
            >
              {link.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
