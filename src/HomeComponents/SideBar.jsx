import React from "react"; 
import { NavLink } from "react-router-dom";

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const links = [
    { name: "Home", path: "", icon: "bx-home-alt-2" },
    { name: "Invited Trips", path: "invited-trips", icon: "bx-cursor-add" },
    { name: "Friends", path: "friends", icon: "bx-group" },
    { name: "Tagged Posts", path: "tagged-posts", icon: "bx-tag" },
    { name: "Mentioned Posts", path: "mentioned-posts", icon: "bx-at" },
    { name: "Mentioned Comments", path: "comments", icon: "bx-message-circle-reply" },
  ];

  return (
    <div className="w-full h-full bg-[#2b2d42] flex flex-col items-center relative">
      
      {/* Toggle Button */}
      <i
        className="bx bx-sidebar text-white px-2 py-3 text-4xl absolute right-2 top-2 cursor-pointer"
        onClick={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Links */}
      <div className="w-full mt-20 flex flex-col items-center">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `
              w-[85%] py-3 px-2 mb-3 rounded-lg
              flex items-center
              ${isSidebarOpen ? "justify-start gap-3" : "justify-center"}
              text-white transition-all duration-300
              ${isActive ? "bg-red-600" : "hover:bg-white/20"}
              `
            }
          >
            <i className={`bx ${link.icon} text-2xl`} />

            {/* Text (only when open) */}
            <span
              className={`
                whitespace-nowrap transition-all duration-300
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

export default SideBar
