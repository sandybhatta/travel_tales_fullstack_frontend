import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetNotificationsQuery } from "../Apis/notificationApi";
import { useSocketContext } from "../context/SocketContext";

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const reduxUserState = useSelector((state) => state.user);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = reduxUserState?._id || userInfo?._id;
  const avatar = reduxUserState?.avatar || userInfo?.avatar;
  const username = reduxUserState?.username || userInfo?.username;

  // Safe checks for hooks
  const notificationQuery = useGetNotificationsQuery();
  const { data: notifications, refetch } = notificationQuery || {};
  
  const socketContext = useSocketContext();
  const socket = socketContext?.socket;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    }
  }, [notifications]);

  useEffect(() => {
    socket?.on("newNotification", () => {
      refetch?.();
    });
    return () => socket?.off("newNotification");
  }, [socket, refetch]);

  const links = [
    { name: "Home", path: "/home", icon: "bx-home-alt-2" },
    { name: "Notifications", path: "notifications", icon: "bx-bell", hasBadge: unreadCount > 0 },
    { name: "Profile", path: `/profile/${userId}`, icon: "bx-user" },
    { name: "Invited Trips", path: "invited-trips", icon: "bx-cursor-add" },
    { name: "Friends", path: "friends", icon: "bx-group" },
    { name: "Tagged Posts", path: "tagged-posts", icon: "bx-tag" },
    { name: "Mentioned Posts", path: "mentioned-posts", icon: "bx-at" },
    { name: "Mentioned Comments", path: "comments", icon: "bx-message-circle-reply" },
  ];

  return (
    <div className="w-full h-full bg-[#2b2d42] flex flex-row justify-around items-center lg:flex-col lg:justify-start lg:items-center relative lg:shadow-xl transition-all duration-300">
      
      {/* Toggle Button */}
      <i
        className="hidden lg:block bx bx-sidebar text-[#EDF2F4] px-2 py-3  text-[0px] lg:text-3xl absolute right-2 top-2 cursor-pointer hover:text-[#EF233C] transition-colors"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* User Info (Mini Profile) */}
      <div className={`hidden  lg:flex mt-16 mb-4 flex-col items-center transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
        <img 
          src={avatar} 
          alt="User" 
          className="w-16 h-16 rounded-full object-cover border-2 border-[#EF233C] shadow-lg mb-2"
        />
        <p className="text-[#EDF2F4] font-medium text-sm">@{username}</p>
      </div>

      {/* Links */}
      <div className={`w-full flex flex-row justify-evenly items-center lg:flex-col lg:gap-2 ${isSidebarOpen ? "lg:mt-2" : "lg:mt-20"}`}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === "/home"}
            className={({ isActive }) =>
              `
              transition-all duration-300 rounded-xl
              flex items-center justify-center
              
              /* Mobile Styles */
              p-2
              
              /* Desktop Styles */
              lg:w-[90%] lg:py-3 lg:px-3
              ${isSidebarOpen ? "lg:justify-start lg:gap-4" : "lg:justify-center"}
              
              text-[#EDF2F4]
              ${isActive ? "bg-[#EF233C] shadow-md scale-105" : "hover:bg-[#8D99AE]/20 hover:scale-105"}
              `
            }
          >
            <div className="relative">
              <i className={`bx ${link.icon} text-2xl min-w-[24px]`} />
              {link.hasBadge && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            {/* Text (only when open and on desktop) */}
            <span
              className={`
                whitespace-nowrap font-medium text-sm tracking-wide transition-all duration-300
                hidden lg:block
                ${isSidebarOpen ? "lg:opacity-100 lg:w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"}
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
