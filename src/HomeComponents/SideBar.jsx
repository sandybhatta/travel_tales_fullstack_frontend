import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const links = [
    { name: "Home", path: "", icon:"bx-home-alt-2" },
    { name: "My Trips", path: "my-trips", icon:"bx-trip" },
    { name: "Collaborated Trips", path: "collaborated-trips", icon:"bx-community" },
    { name: "Bookmarked Posts", path: "bookmarked-posts", icon:"bx-bookmark" },
    { name: "Invited Trips", path: "invited-trips", icon:"bx-cursor-add" },
    { name: "Friends", path: "friends", icon:"bx-group"},
    { name: "Explore", path: "explore", icon:"bx-star-circle" },
    
  ];

  return (
    <div className="w-full h-screen bg-[#2b2d42] border-2 border-white flex flex-col items-center justify-around sticky top-0">
      <div className="w-full  py-4 flex flex-col items-center justify-center">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `w-[85%] py-3 px-2 mb-5 rounded-lg flex items-center justify-center relative text-white transition ${
                isActive ? "bg-red-600" : "bg-transparent hover:bg-white/40"
              }`
            }
          >
            <i className={`bx ${link.icon} text-2xl absolute left-0 pl-2`}></i>
            {link.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SideBar;