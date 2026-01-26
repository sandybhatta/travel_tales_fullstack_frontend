import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";

const VISIBILITY_OPTIONS = [
  "public",
  "followers",
  "close_friends",
  "private",
];

const Settings = ({
  visibility,
  setVisibility,
  inviteFriends,
  setInviteFriends,
}) => {
  const { _id, following } = useSelector((state) => state.user);

  const [openVisibility, setOpenVisibility] = useState(false);
  const [query, setQuery] = useState("");

  const addFriend = (user) => {
    if (inviteFriends.some((u) => u._id === user._id)) return;
    setInviteFriends([...inviteFriends, user]);
  };

  const removeFriend = (id) => {
    setInviteFriends(inviteFriends.filter((u) => u._id !== id));
  };

  const filteredFollowings = useMemo(() => {
    if (!following) return [];
    if (!query.trim()) return following;
    
    return following.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [following, query]);

  const isSelectedInvites = (user) => {
    return inviteFriends?.some((u) => u._id === user._id);
  };

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-10">
      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
          Profile Visibility
        </h3>

        <div
          onClick={() => setOpenVisibility((prev) => !prev)}
          className="cursor-pointer flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 hover:border-red-500 transition"
        >
          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <i
              className={`bx text-xl sm:text-2xl text-red-500 bx-${
                visibility === "public"
                  ? "globe"
                  : visibility === "followers"
                  ? "group"
                  : visibility === "close_friends"
                  ? "user-check"
                  : "lock"
              }`}
            ></i>

            <span className="capitalize text-sm sm:text-base">
              {visibility.replace("_", " ")}
            </span>
          </div>

          <i
            className={`bx bx-chevron-${
              openVisibility ? "up" : "down"
            } text-2xl sm:text-3xl`}
          />
        </div>

        {openVisibility && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full rounded-2xl p-2 sm:p-4 shadow-xl flex flex-col gap-2 mt-2"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setVisibility(opt);
                  setOpenVisibility(false);
                }}
                className={`px-3 py-2 sm:px-4 rounded-xl text-left capitalize transition flex items-center justify-start gap-2 sm:gap-3 text-sm sm:text-base ${
                  visibility === opt
                    ? "bg-red-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <i
                  className={`bx text-xl sm:text-2xl bx-${
                    opt === "public"
                      ? "globe"
                      : opt === "followers"
                      ? "group"
                      : opt === "close_friends"
                      ? "user-check"
                      : "lock"
                  }`}
                ></i>
                {opt.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
          Invite Friends
        </h3>

        {/* Selected Friends */}
        {inviteFriends.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {inviteFriends.map((u) => (
              <span
                key={u._id}
                className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs sm:text-sm cursor-pointer font-semibold"
                onClick={() => removeFriend(u._id)}
              >
                @{u.username}
                <button>
                  <i className="bx bx-x text-lg sm:text-xl" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <input
          placeholder="Search followings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm sm:text-base"
        />

        {/* List */}
        <div className="max-h-60 sm:max-h-72 overflow-y-auto flex flex-col gap-2">
          {filteredFollowings.length > 0 ? (
            filteredFollowings.map((user) => (
              <div
                key={user._id}
                onClick={() => !isSelectedInvites(user) && addFriend(user)}
                className={`flex items-center gap-3 p-2 sm:p-3 rounded-xl transition ${
                  isSelectedInvites(user)
                    ? "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "hover:bg-red-50 cursor-pointer"
                }`}
              >
                <img
                  src={user.avatar?.url || user.avatar}
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <p className="font-medium text-sm sm:text-base">{user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    @{user.username}
                  </p>
                </div>
                {isSelectedInvites(user) && (
                  <i className="bx bx-check text-green-500 text-xl ml-auto"></i>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              {query ? "No friends found." : "Start typing to search friends."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
