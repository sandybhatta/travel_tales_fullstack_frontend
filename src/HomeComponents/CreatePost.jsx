import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import TripCreation from "./TripCreation";
import PostCreate from "./PostCreate";
import TripCreate from "./TripCreate";

const CreatePost = ({ createModal, setCreateModal }) => {

  const [creationTab, setCreationTab] = useState("");

  const reduxAvatar = useSelector((state) => state.user.avatar);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userAvatar = userInfo.avatar;
  const avatar = reduxAvatar || userAvatar;

  

  return (
    <div className="w-full h-auto flex justify-center overflow-x-hidden mt-5  ">
      <div
        className="w-full px-2 py-2 bg-[#fff] rounded-xl shadow-2xl flex items-center justify-center  gap-4 transition-all duration-300   cursor-pointe r"
        onClick={(e) => {
          e.stopPropagation();
          setCreateModal(true);
        }}
      >
        <div className=" w-full h-full  flex flex-wrap justify-start items-center  px-4 py-2 ">
          <img
            src={avatar}
            alt="User Avatar"
            className="h-10 rounded-full object-cover"
          />

          <div className="flex flex-col items-start justify-start gap-2 px-2 ">

            <div className="flex items-center justify-start w-full ">
            <i className='bx  bx-pencil-sparkles text-4xl text-red-500'></i>
            <h3 className="text-2xl text-red-500 font-semibold leckerli">Create Posts & Trips</h3> 
            </div>



            
          </div>
        </div>
      </div>

      {createModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={(e) => {
      e.stopPropagation();
      setCreationTab("");
      setCreateModal(false);
    }}
  >
    <div
      className="relative w-[90%] max-w-2xl bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-6 animate-scaleIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Icon */}
      <i
        className="bx bx-x absolute right-6 top-6 text-3xl text-gray-500 hover:text-black cursor-pointer transition"
        onClick={(e) => {
          e.stopPropagation();
          setCreationTab("");
          setCreateModal(false);
        }}
      ></i>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/10">
          <i className="bx  bx-pencil-draw text-red-500 text-3xl"></i>
        </div>
        <h3 className="text-3xl leckerli text-red-500">
          Create New Content
        </h3>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200"></div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Create Post */}
        <div
          className="group rounded-2xl border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:border-red-500 hover:shadow-xl hover:-translate-y-1"
          onClick={() => {
            setCreateModal(false);
            setCreationTab("Post");
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition">
              <i className="bx bx-film-roll-alt text-3xl text-red-500"></i>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-gray-800">
                Create Post
              </h2>
              <p className="text-sm text-gray-500">
                Share photos and moments from your travels
              </p>
            </div>
          </div>
        </div>

        {/* Create Trip */}
        <div
          className="group rounded-2xl border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:border-red-500 hover:shadow-xl hover:-translate-y-1"
          onClick={() => {
            setCreateModal(false);
            setCreationTab("Trip");
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition">
              <i className="bx bx-camping text-3xl text-red-500"></i>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-gray-800">
                Create Trip
              </h2>
              <p className="text-sm text-gray-500">
                Plan a new adventure with friends and make it memorable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {creationTab === "Post" && (
        <PostCreate
          setCreationTab={setCreationTab}
          setCreateModal={setCreateModal}
        />
      )} 
       
       {creationTab === "Trip" && (
        <TripCreate  setCreationTab={setCreationTab}
        setCreateModal={setCreateModal}/>
      )}
    </div>
  );
};

export default CreatePost;
//   <i className='bx  bx-image text-[#ffffff]' ></i>
//       <i class='bx  bx-video text-[#ffffff]' ></i>
//       <i class='bx  bx-trip text-[#ffffff]' ></i>
//       <i class='bx  bx-price-tag text-[#ffffff]'></i>
//       <i class='bx  bx-send text-[#ffffff]'></i>
