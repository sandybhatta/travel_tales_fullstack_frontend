import React from "react";

/**
 * Navigation tabs for switching between different content views.
 */
const ProfileTabs = ({ activeTab, onTabClick, ownProfile }) => {
  const tabs = [
    { key: "posts", label: "Posts", icon: "bx-image-alt" },
    { key: "trips", label: "Trips", icon: "bx-trip" },
    { key: "collaboratedTrips", label: "Collaborated", icon: "bx-group" },
    { key: "sharedPosts", label: "Shared", icon: "bx-send" },
  ];

  if (ownProfile) {
    tabs.push({ key: "bookmarks", label: "Bookmarked", icon: "bx-bookmark" });
  }

  return (
    <div className="flex justify-between md:justify-start gap-1 md:gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabClick(tab.key)}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-2 md:px-4 border-b-2 transition-colors whitespace-nowrap min-w-[60px] ${
            activeTab === tab.key
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <i className={`bx ${tab.icon} text-xl md:text-lg`} />
          <span className="hidden md:inline text-sm font-semibold uppercase tracking-wide">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
