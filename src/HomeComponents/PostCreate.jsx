import React, { useEffect, useMemo, useRef, useState } from "react";
import mainApi from "../Apis/axios";
import { useSelector } from "react-redux";
import useDebounce from "../CustomHooks/useDebounceHook";

const PostCreate = ({ setCreationTab, setCreateModal }) => {

const[error,setError] = useState("")
const[hasMore,setHasMore] = useState(true)
const [ followings, setFollowings] = useState([])
const[skip,setSkip] = useState(0)
const {_id,location} = useSelector(state=>state.user)

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");


//   for tag related states
  const [tagOpen, setTagOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
const [tagQuery , setTagQuery] = useState("")
const debouncedQuery = useDebounce(tagQuery);


const[tagUsersLoading, setTagUsersLoading] = useState(false)
const[tagUsersError, setTagUsersError] = useState("")


// visibility related states
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState("public");
// location related states
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationArea, setLocationArea] = useState(location);




  const [caption, setCaption] = useState("");

  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fileRef = useRef(null);
    const lastUserRef = useRef(null)


    const fetchFollowings = async () => {
        if (!hasMore || tagUsersLoading) return;
    
        setTagUsersLoading(true);
        setTagUsersError("");
    
        try {
          const res = await mainApi.get(
            `/api/user/${_id}/following?skip=${skip}`
          );
    
          setFollowings((prev) => [...prev, ...res.data.followingList]);
          setHasMore(res.data.hasMore);
          setSkip((prev) => prev + 10);
        } catch (err) {
            setTagUsersError(err?.response?.data?.message || "Failed to load users");
        } finally {
            setTagUsersLoading(false);
        }
      };
    
    // initial fetch of followings
    useEffect(() => {
        if (!tagOpen) return;
    
        setFollowings([]);
        setSkip(0);
        setHasMore(true);
        setTagUsersError("");
        fetchFollowings();
      }, [tagOpen]);
    
      useEffect(() => {
        if (!tagOpen) return;
        if (!hasMore) return;
        if (!lastUserRef.current) return;
      
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
                fetchFollowings();
            }
          },
          { threshold: 0.2 }
        );
      
        observerRef.current.observe(lastUserRef.current);
      
        return () => observerRef.current.disconnect();
      }, [followings, tagOpen, hasMore]);


    
    
    
    
    
    
      const filteredUsers = useMemo(() => {
        if (!debouncedQuery.trim()) return followings;
    
        return followings.filter(
          (u) =>
            u.username.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            u.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
      }, [debouncedQuery, followings]);


      const canTagUser = (user) => {
        if (user._id === _id) return false;
        if (taggedUsers.some((u) => u._id === user._id)) return false;
        return true;
      };


  const handleCaption = (e) => {
    if (e.target.value.length <= 1000) {
      setCaption(e.target.value);
    }
  };

  const handleFiles = (newFiles) => {
    setFileError("");
    if (files.length > 20) {
      setFileError("Already 20 files are selected");
      return;
    }

    const incomingFiles = Array.from(newFiles);
    let media = [...files, ...incomingFiles];
    let toatalFileSize = media.reduce((acc, file) => acc + file.size, 0);

    if (toatalFileSize > MAX_FILE_SIZE) {
      setFileError("Total image and video size should be under 10MB");
      return;
    }

    if (media.length > MAX_FILES) {
      media = media.slice(0, MAX_FILES);
    }

    media = media.map((file) => ({
      file,
      type: file.type.startsWith("image") ? "image" : "video",
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    setFiles(media);
  };

  const removeFile = (fileIndex) => {
    setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
  };


  const openTagDropdown = () => {
    setTagOpen(true);
  

    if (followings.length === 0) {
      setSkip(0);
      setHasMore(true);
      setError("");
      fetchFollowings();
    }
  };
  




const handleCreatePost = async()=>{
 const formData = new FormData();
 formData.append("caption",caption)
 formData.append("taggedUsers",[...taggedUsers.map(user=>user._id)])
}

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
             min-h-screen overflow-y-auto
             flex justify-center py-10 px-4"
      onClick={() => {
        setCreationTab("");
        setCreateModal(false);
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#edf2f4] rounded-2xl shadow-2xl
             p-6 flex flex-col gap-6 h-fit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          <i className="bx bx-image-plus text-4xl text-red-500"></i>
          <h2 className="text-2xl font-semibold text-gray-800 leckerli">
            Create Post
          </h2>
        </div>

        {/* Caption */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Caption</h3>
            <span className="text-sm text-gray-500">{caption.length}/1000</span>
          </div>

          <textarea
            className="resize-none w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm bg-white"
            value={caption}
            onChange={handleCaption}
            placeholder="Write something meaningful about your post..."
          />
        </div>

        {/* Media Upload */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium text-gray-800">Photos & Videos</h3>

          <div
            className="border-4 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition bg-white"
            onClick={() => fileRef.current.click()}
          >
            <i className="bx bx-cloud-upload text-6xl text-gray-400"></i>
            <p className="text-lg font-medium text-gray-700">
              Click to upload photos & videos
            </p>
            <p className="text-sm text-gray-500">
              Max 20 files | Total size ≤ 10MB
            </p>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              ref={fileRef}
            />
          </div>

          {fileError && (
            <p className="text-red-500 text-sm font-medium">{fileError}</p>
          )}

          {/* Media Preview */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file, ind) => (
                <div
                  key={ind}
                  className="relative group rounded-xl overflow-hidden shadow-md"
                >
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition duration-200 ease-in flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(ind);
                    }}
                  >
                    <i className="bx bx-x text-xl"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* visibility */}

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium text-gray-800">Post Visibility</h3>

          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Selected visibility */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => {
                setVisibilityOpen((prev) => !prev);
              }}
            >
              <div className="flex items-center gap-3">
                <i
                  className={`bx text-2xl text-red-500 bx-${
                    visibilityStatus === "public"
                      ? "globe"
                      : visibilityStatus === "followers"
                      ? "group"
                      : visibilityStatus === "close_friends"
                      ? "user-check"
                      : "lock"
                  }`}
                ></i>

                <p className="text-gray-800 font-medium">
                  {visibilityStatus === "public"
                    ? "Public"
                    : visibilityStatus === "followers"
                    ? "Followers"
                    : visibilityStatus === "close_friends"
                    ? "Close Friends"
                    : "Private"}
                </p>
              </div>

              <i
                className={`bx bx-chevron-${
                  visibilityOpen ? "up" : "down"
                } text-2xl text-gray-500`}
              ></i>
            </div>

            {/* Dropdown */}
            {visibilityOpen && (
              <div className="border-t border-gray-200 divide-y">
                {["public", "followers", "close_friends", "private"].map(
                  (visibility, i) => {
                    const status =
                      visibility === "public"
                        ? "Public"
                        : visibility === "followers"
                        ? "Followers"
                        : visibility === "close_friends"
                        ? "Close Friends"
                        : "Private";

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition
                  ${
                    visibilityStatus === visibility
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                        onClick={() => {
                          setVisibilityStatus(visibility);
                          setVisibilityOpen(false);
                        }}
                      >
                        <i
                          className={`bx text-2xl bx-${
                            visibility === "public"
                              ? "globe"
                              : visibility === "followers"
                              ? "group"
                              : visibility === "close_friends"
                              ? "user-check"
                              : "lock"
                          }`}
                        ></i>

                        <p className="font-medium">{status}</p>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>




        {/* Location */}

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium text-gray-800">Post Location</h3>

          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Selected visibility */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => {
                setLocationOpen((prev) => !prev);
              }}
            >
              <div className="flex items-center gap-3">
                <span>{locationArea?.city||"no city selected"}</span>,
                <span>{locationArea?.state||"no state selected"}</span>,
                <span>{locationArea?.country||"no country selected"}</span>
                
              </div>

              <i
                className={`bx bx-chevron-${
                  locationOpen ? "up" : "down"
                } text-2xl text-gray-500`}
              ></i>
            </div>

            {/* Dropdown */}
            {locationOpen && (
              <div className="w-full flex flex-col items-start justify-center gap-3 px-3 py-3 bg-[#edf2f4]">
                <div className="flex flex-col items-start justify-center gap-1.5">
                    <h3 className="text-lg font-medium text-gray-800">City</h3>
                    <input type="text" className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl" value={locationArea.city} onChange={(e)=>{
                        setLocationArea(prev=>({
                            ...prev,
                            city:e.target.value
                        }))
                    }}/>
                </div>
                <div className="flex flex-col items-start justify-center gap-1.5">
                    <h3 className="text-lg font-medium text-gray-800">State</h3>
                    <input type="text" className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl" value={locationArea.state} onChange={(e)=>{
                        setLocationArea(prev=>({
                            ...prev,
                            state:e.target.value
                        }))
                    }}/>
                </div>
                <div className="flex flex-col items-start justify-center gap-1.5">
                    <h3 className="text-lg font-medium text-gray-800">Country</h3>
                    <input type="text" className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl" value={locationArea.country} onChange={(e)=>{
                        setLocationArea(prev=>({
                            ...prev,
                            country:e.target.value
                        }))
                    }}/>
                </div>
              </div>
            )}
          </div>
        </div>

          

 {/* ---------------- TAG PEOPLE ---------------- */}
 <div className="flex flex-col gap-3 tag-wrapper">
          <h3 className="text-lg font-medium text-gray-800">Tag people</h3>

          <div className="bg-white rounded-xl  shadow-sm">
            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3">
              <i className="bx bx-user-plus text-2xl text-red-500" />
              <input
                type="text"
                value={tagQuery}
                placeholder="Search people you follow..."
                className="flex-1 outline-none"
                onFocus={openTagDropdown}
                onChange={(e) => setTagQuery(e.target.value)}
              />
            </div>

            {/* Tagged Chips */}
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {taggedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm"
                  >
                    @{u.username}
                    <i
                      className="bx bx-x cursor-pointer"
                      onClick={() =>
                        setTaggedUsers((prev) =>
                          prev.filter((x) => x._id !== u._id)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Dropdown */}
            {tagOpen && (
              <div className="border-t max-h-64 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 ">
                  <span className="text-sm font-medium">Select users</span>
                  <button
                    onClick={() => {
                      setTagOpen(false);
                      setTagQuery("");
                      setTagUsersError("");
                    }}
                  >
                    <i className="bx bx-x text-2xl text-gray-500" />
                  </button>
                </div>

                {/* Loading Shimmer */}
                {tagUsersLoading && (
                  <div className="p-4 space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 w-1/3 rounded" />
                          <div className="h-2 bg-gray-200 w-1/4 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error */}
                {tagUsersError && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                      className="text-sm underline mt-2"
                      onClick={() => setTagOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* User List */}
                {!tagUsersLoading &&
                  !tagUsersError &&
                  filteredUsers.map((user, i) => (
                    <div
                      key={user._id}
                      ref={
                        i === filteredUsers.length - 1
                          ? lastUserRef
                          : null
                      }
                      className={`flex items-center gap-4 px-4 py-3 cursor-pointer
                        ${
                          canTagUser(user)
                            ? "hover:bg-red-50"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      onClick={() => {
                        if (canTagUser(user)) {
                          setTaggedUsers((prev) => [...prev, user]);
                        }
                      }}
                    >
                      <img
                        src={user.avatar?.url || user.avatar}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">@{user.username}</p>
                        <p className="text-xs text-gray-500">{user.name}</p>
                        {user._id === _id && (
                          <p className="text-xs text-red-500">
                            You can’t tag yourself
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                {!hasMore && !tagUsersLoading && (
                  <p className="text-center text-sm py-3 text-gray-400">
                    — No more users —
                  </p>
                )}
              </div>
            )}
          </div>
        </div>


<div  className="w-full flex items-center justify-end ">
                    <div className= {`leckerli text-3xl font-semibold px-2 py-1.5 rounded-md bg-red-500 shadow-2xl  text-white ${caption.length>0 || files.length>0 ? "cursor-pointer":"cursor-not-allowed pointer-events-none"} `}
                    onClick={caption.length>0 || files.length>0 ? handleCreatePost:undefined}
                    >
                        Create Post
                    </div>
</div>

      </div>
    </div>
  );
};

export default PostCreate;
