import React, { useState } from "react";
import { useSelector } from "react-redux";
import PostCreate from "./PostCreate";
import TripCreate from "./TripCreate";

const CreatePost = ({ createModal, setCreateModal }) => {
  const [creationTab, setCreationTab] = useState("");
  const reduxAvatar = useSelector((state) => state.user.avatar);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userAvatar = userInfo?.avatar;
  const avatar = reduxAvatar || userAvatar;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4">
      {/* Trigger Card */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
        onClick={() => setCreateModal(true)}
      >
        <img
          src={avatar}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
        />
        
        <div className="flex-1 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-6 py-3 text-gray-500 font-medium text-sm sm:text-base truncate">
          Share your travel adventures or plan a new trip...
        </div>

        <div className="flex items-center gap-3 text-gray-400">
           <div className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors hidden sm:block">
              <i className='bx bx-image-add text-2xl'></i>
           </div>
           <div className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors hidden sm:block">
              <i className='bx bx-map-alt text-2xl'></i>
           </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {createModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => {
            setCreationTab("");
            setCreateModal(false);
          }}
        >
          {/* Modal Content */}
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn relative"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button */}
             <button 
                onClick={() => {
                  setCreationTab("");
                  setCreateModal(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
             >
               <i className="bx bx-x text-2xl"></i>
             </button>

             <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 leckerli text-center">Create New</h2>
                <p className="text-gray-500 text-center mb-8">Choose what you want to share with the world</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Post Option */}
                  <div 
                    className="group relative p-6 rounded-2xl border-2 border-gray-100 hover:border-red-500 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white overflow-hidden"
                    onClick={() => {
                        setCreateModal(false);
                        setCreationTab("Post");
                    }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <i className="bx bx-images"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Post</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">Share photos & videos from your latest journey.</p>
                    </div>
                  </div>

                  {/* Trip Option */}
                  <div 
                    className="group relative p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white overflow-hidden"
                    onClick={() => {
                        setCreateModal(false);
                        setCreationTab("Trip");
                    }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <i className="bx bx-camping"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Trip</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">Plan a new adventure and invite your friends.</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Render Selected Modal */}
      {creationTab === "Post" && (
        <PostCreate
          setCreationTab={setCreationTab}
          setCreateModal={setCreateModal}
        />
      )}
      
      {creationTab === "Trip" && (
        <TripCreate 
          setCreationTab={setCreationTab}
          setCreateModal={setCreateModal}
        />
      )}
    </div>
  );
};

export default CreatePost;
