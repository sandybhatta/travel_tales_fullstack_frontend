import React, { useEffect, useRef, useState } from "react";
import mainApi from "../Apis/axios";
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
  const { _id } = useSelector((state) => state.user);


  const [openVisibility, setOpenVisibility] = useState(false);

 
  const [query, setQuery] = useState("");
  const [followings, setFollowings] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);
  const lastItemRef = useRef(null);

  const LIMIT = 10;


  
  const fetchFollowings = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);

      const res = await mainApi.get(
        `/api/user/${_id}/following?limit=${LIMIT}&skip=${reset ? 0 : skip}`
      );

      const data = res.data.followingList;

      setFollowings((prev) =>
        reset ? data : [...prev, ...data]
      );
      setHasMore(res.data.hasMore);
      setSkip((prev) => (reset ? LIMIT : prev + LIMIT));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  
  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    fetchFollowings(true);
  }, [query]);


  
  useEffect(() => {
    if (loading) return;

    if (observerRef.current)
      observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchFollowings();
        }
      },
      { threshold: 1 }
    );

    if (lastItemRef.current)
      observerRef.current.observe(lastItemRef.current);
  }, [followings, loading, hasMore]);


  
  const addFriend = (user) => {
    if (inviteFriends.some((u) => u._id === user._id)) return;
    setInviteFriends([...inviteFriends, user]);
  };


  
  const removeFriend = (id) => {
    setInviteFriends(inviteFriends.filter((u) => u._id !== id));
  };


  const filteredFollowings = followings.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase())
  );

  const isSelectedInvites = (user)=>{
    return inviteFriends?.some(u=> u._id === user._id)
  }

  return (
    <div className="w-full flex flex-col gap-10">
   
   
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="font-semibold text-gray-800 mb-3">
          Profile Visibility
        </h3>

        <div
          onClick={() => setOpenVisibility(prev=>!prev)}
          className="cursor-pointer flex justify-between items-center px-4 py-3 rounded-xl border border-gray-300 hover:border-red-500 transition"
        >
            <div className="flex items-center justify-start gap-3">
            <i
                      className={`bx text-2xl text-red-500 bx-${
                        visibility === "public"
                          ? "globe"
                          : visibility === "followers"
                          ? "group"
                          : visibility === "close_friends"
                          ? "user-check"
                          : "lock"
                      }`}
                    ></i>

                    <span className="capitalize">{visibility.replace("_", " ")}</span>
            </div>
          
          <i className= {`bx bx-chevron-${openVisibility?"up":"down"} text-3xl`}  />
        </div>

        {openVisibility && (
          
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-2xl p-4 shadow-xl flex flex-col gap-2"
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setVisibility(opt);
                    setOpenVisibility(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-left capitalize transition flex item-center justify-start gap-3 ${
                    visibility === opt
                      ? "bg-red-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                    <i
                      className={`bx text-2xl  bx-${
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

 
 
      <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800">
          Invite Friends
        </h3>

        {/* Selected Friends */}
        {inviteFriends.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {inviteFriends.map((u) => (
              <span
                key={u._id}
                className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm cursor-pointer font-semibold"
                onClick={() => removeFriend(u._id)}
              >
                @{u.username}
                <button>
                  <i className="bx bx-x text-xl" />
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
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
        />

        {/* List */}
        <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
          {filteredFollowings.map((user, idx) => {
            const isLast = idx === filteredFollowings.length - 1;

            return (
              <div
                ref={isLast ? lastItemRef : null}
                key={user._id}
                onClick={() => addFriend(user)}
                className= {`flex items-center gap-3 p-3 rounded-xl hover:bg-red-100 cursor-pointer transition ${isSelectedInvites(user)?" bg-gray-300 cursor-not-allowed pointer-events-none":"bg-gray-100 cursor-pointer"}`}
              >
                <img
                  src={user.avatar?.url || user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    @{user.username}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 animate-pulse"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300" />
      
                {/* Text */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 w-32 bg-gray-300 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
