import React from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost";

const HomeFeed = () => {
  const navigate = useNavigate();

  return (
  <div className="w-full lg:w-[70%] relative flex justify-center bg-[#fff]">
  <CreatePost/>
  </div>
  );
};

export default HomeFeed;
