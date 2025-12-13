import React, { useCallback, useEffect, useRef, useState } from "react";
import mainApi from "../Apis/axios";
import { useSelector } from "react-redux";
import SeeAllTaggedUsers from "./SeeAllTaggedUsers";

const TagUsers = ({ taggedUsers, setTaggedUsers, setTagOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [followingsOfUser, setFollowingsOfUser] = useState({
    count: 0,
    followingList: [],
    hasMore: false,
  });
  const [skip, setSkip] = useState(0);
  const [seeAllTaggedUser , setSeeAllTaggedUsers] = useState(false)
  const observer = useRef();
  const userId = useSelector((state) => state.user._id);

  const fetchFollowingsOfUser = async () => {
    try {
      const { data } = await mainApi.get(`/api/user/${userId}/following`, {
        params: {
          skip,
          limit: 10,
        },
      });

      setFollowingsOfUser((prev) => ({
        ...data,
        followingList: [...prev.followingList, ...data.followingList],
      }));

      setSkip((prev) => prev + 10);
    } catch (error) {
      console.error("Error fetching followings:", error);
    }
  };

  const lastUserRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && followingsOfUser.hasMore) {
          fetchFollowingsOfUser();
        }
      });

      if (node) observer.current.observe(node);
    },
    [followingsOfUser.hasMore]
  );

  useEffect(() => {
    fetchFollowingsOfUser();
  }, []);

  const handleTag = (id) => {
    if(!taggedUsers.includes(id)){
         setTaggedUsers((prev) => [...prev, id]);
    }else{
        setTaggedUsers(prev=>prev.filter(taggedUserId=>taggedUserId !== id))
    }
   
  };

  const filteredUser = followingsOfUser.followingList.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-fit min-h-screen absolute top-0 left-0 bg-black/50 shadow-2xl z-20 flex flex-col items-center gap-5 px-5 py-5 backdrop-blur-2xl rounded-lg">
      <i
        className="bx bx-x text-3xl cursor-pointer text-white absolute top-5 right-2"
        onClick={() => {
          setTagOpen(false);
        }}
      ></i>

      <div className="w-[75%] h-[50px] mt-5 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-full rounded-lg border-none outline-none bg-white text-black text-lg px-5"
        />
        {taggedUsers.length >0 && 
      <p className="absolute top-15 right-5 cursor-pointer text-white flex items-center"
      onClick={()=>setSeeAllTaggedUsers(prev=>!prev)}
      >
        <i className="bx bx-chevrons-left text-white text-2xl"></i>
        See all Tagged Users
      </p>
      }
      </div>

      

      {/* followings list */}
      {
        seeAllTaggedUser && taggedUsers.length>0?
        <SeeAllTaggedUsers 
        taggedUsers={taggedUsers} 
        setTaggedUsers={setTaggedUsers} 
        users={followingsOfUser.followingList}/>
        :
        <div className="w-[75%] h-auto mt-10 flex justify-center items-center">
        {followingsOfUser.count === 0 ? (
          <p className="w-full h-full text-center text-2xl text-white">
            you are currently not following anyone
          </p>
        ) : (
          <div className="w-full flex flex-col justify-center items-center gap-5">
            {filteredUser.map((following, index) => {
              const avatar = following.avatar?.url || following.avatar;
              const isLastUser = index === filteredUser.length - 1;

              return (
                <div
                  key={following._id}
                  ref={isLastUser ? lastUserRef : null}
                  className="w-full bg-[#2B2D42] rounded-lg flex items-center justify-around gap-1 px-5 py-2 text-white"
                >
                  <div className="w-[10%] h-full">
                    <img
                      src={avatar}
                      alt="user"
                      className="object-contain h-1/2 w-full"
                    />
                  </div>
                  <div className="h-full w-[80%] flex flex-col items-center justify-center gap-1">
                    <p>{following.name}</p>
                    <p>@{following.username}</p>
                  </div>
                  <button
                    className={`px-3 py-2 text-xl cursor-pointer text-white ${taggedUsers.includes(following._id)? "bg-red-500" :"bg-green-500"} rounded-lg`}
                    onClick={() => handleTag(following._id)}
                  >
                    {taggedUsers.includes(following._id) ? "UnTag" : "Tag"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      }
      
    </div>
  );
};

export default TagUsers;
