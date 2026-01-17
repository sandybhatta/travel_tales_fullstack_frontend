import React, { useState } from "react";
import CreatePost from "./CreatePost";
import PostFeed from "./PostFeed";
import ExploreFeed from "./ExploreFeed";
import TripFeed from "./TripFeed";
import DiscoverFeed from "./DiscoverFeed";

const HomeFeed = ({ createModal, setCreateModal }) => {
  const [activeTab, setActiveTab] = useState("posts"); // "posts", "explore", "trips", or "discover"
  const [tripFilter, setTripFilter] = useState("visible"); // "visible" or "public"

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-5 py-5">
      {/* Create Post Component */}
      <div className="w-full max-w-2xl mb-6">
        <CreatePost createModal={createModal} setCreateModal={setCreateModal} />
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === "posts"
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Posts
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === "explore"
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Explore
            {activeTab === "explore" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === "trips"
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Trips
            {activeTab === "trips" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === "discover"
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Discover
            {activeTab === "discover" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* Filter Buttons - Only for Trips */}
      {activeTab === "trips" && (
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setTripFilter("visible")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                tripFilter === "visible"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Visible Trips
            </button>
            <button
              onClick={() => setTripFilter("public")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                tripFilter === "public"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Public Trips
            </button>
          </div>
        </div>
      )}

      {/* Feed Content */}
      <div className="w-full">
        {activeTab === "posts" ? (
          <PostFeed />
        ) : activeTab === "explore" ? (
          <ExploreFeed />
        ) : activeTab === "trips" ? (
          <TripFeed filter={tripFilter} />
        ) : (
          <DiscoverFeed />
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
