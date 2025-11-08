import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import VisibilityOfPost from "./VisibilityOfPost";
import TagUsers from "./TagUsers";
import Destinations from "./Destinations";

const TripCreation = ({ setCreationTab }) => {
  const [tagOpen, setTagOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState("public");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);

  const [budget, setBudget] = useState("");

  const [destinationOpen, setDestinationOpen] = useState(false);

  const [destinations, setDestinations] = useState([
    {
      city: "",
      state: "",
      country: "",
    },
  ]);

  const textRef = useRef(null);
  const imageRef = useRef(null);

  const [selectedTags, setSelectedTags] = useState([]);
  const reduxUser = useSelector((state) => state.user);
  const { name, username, avatar } = reduxUser;

  useEffect(() => {
    textRef.current.style.height = "auto";
    textRef.current.style.height = textRef.current.scrollHeight + "px";
  }, [description]);

  const tags = [
    "adventure",
    "beach",
    "mountain",
    "city",
    "honeymoon",
    "family",
    "solo",
    "friends",
    "luxury",
    "budget",
    "wildlife",
    "roadtrip",
    "spiritual",
  ];

  const numbers = "1234567890";

  const handleTitle = (e) => {
    let text = e.target.value;
    if (text.length <= 100) {
      setTitle(text);
    } else {
      text = text.slice(0, 100);
      setTitle(text);
    }
  };

  const handleDescription = (e) => {
    if (e.target.value.length <= 1000) {
      setDescription(e.target.value);
    }
  };

  const handleCoverPhoto = (e) => {
    const imageFile = e.target.files[0];

    if (imageFile.size > 10 * 1024 * 1024) {
      return;
    }

    setCoverPhoto(imageFile);
  };

  const handleBudget = (e) => {
    const number = e.target.value.slice(budget.length);

    // deleting
    if (e.target.value.length < budget.length) {
      setBudget(e.target.value);
    } else if (numbers.split("").includes(number)) {
      setBudget(e.target.value);
    }
  };

  return (
    <div className="w-full h-auto  bg-[#8D99AE] absolute left-[50%] -translate-x-[50%] flex flex-col items-center justify-start py-5">
      {visibilityOpen && (
        <VisibilityOfPost
          visibilityStatus={visibilityStatus}
          setVisibilityStatus={setVisibilityStatus}
          setVisibilityOpen={setVisibilityOpen}
        />
      )}

      <div className="flex flex-wrap w-auto h-auto ">
        <div className="w-[50px] h-full">
          <img src={avatar} className="object-contain w-full" />
        </div>
        <div className="flex flex-col">
          <p className="text-2xl text-white">{name} </p>
          <p className="text-sm text-white">@{username} </p>
        </div>
        <div className="ml-5 flex gap-3">
          {/* tag a user */}
          <i
            className="text-4xl text-white bx  bx-user-plus relative group   cursor-pointer"
            onClick={() => {
              setTagOpen(!tagOpen);
              setVisibilityOpen(false);
            }}
          >
            <span
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap"
            >
              Tag
            </span>
          </i>

          {/* set visibility */}
          <i
            className={`text-4xl text-white bx  ${
              visibilityStatus === "public"
                ? "bx-community"
                : visibilityStatus === "followers"
                ? "bx-group"
                : visibilityStatus === "close_friends"
                ? "bxs-user-check"
                : "bx-lock-keyhole"
            } text-3xl cursor-pointer  relative group `}
            onClick={() => {
              setTagOpen(false);
              setVisibilityOpen(!visibilityOpen);
            }}
          >
            <span
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap"
            >
              Visibility
            </span>
          </i>

          {tagOpen && (
            <TagUsers
              taggedUsers={taggedUsers}
              setTaggedUsers={setTaggedUsers}
              setTagOpen={setTagOpen}
            />
          )}
        </div>
      </div>
      {/* to exit from trip creation */}

      <i
        className="bx bx-x text-3xl text-white absolute top-5 right-5 cursor-pointer"
        onClick={() => setCreationTab("")}
      ></i>

      {/* title bar */}
      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10">
        <h2 className="text-3xl font-semibold leckerli text-white">
          Title of Your Trip
        </h2>
        <input
          type="text"
          onChange={handleTitle}
          value={title}
          className="w-full h-[35px] bg-white text-xl font-semibold border-none px-2 py-7 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
        />
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2 className="text-3xl font-semibold leckerli text-white">
          {" "}
          Trip Description{" "}
        </h2>
        <textarea
          ref={textRef}
          value={description}
          onChange={handleDescription}
          className="resize-none w-full  bg-white text-xl border-none px-2 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
        />
        <span className="absolute top-5 text-white text-sm right-2">
          {description.length}/1000 characters
        </span>
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2
          className="w-fit text-3xl font-semibold leckerli text-white flex items-center cursor-pointer"
          onClick={() => {
            setDestinationOpen((prev) => !prev);
          }}
        >
          <i className="bx bx-location-plus text-3xl text-white"></i>
          Add Destinations
        </h2>
        {destinationOpen && destinations.length > 0 && (
          <Destinations
            setDestinationOpen={setDestinationOpen}
            destinations={destinations}
            setDestinations={setDestinations}
          />
        )}
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2 className="text-3xl font-semibold leckerli text-white">
          Cover Photo
        </h2>

        <div className="relative">
          {coverPhoto ? (
            <img src={coverPhoto ? URL.createObjectURL(coverPhoto) : null} />
          ) : (
            <div
              className="w-full h-[50vh] bg-[#EDF2F4] flex flex-col items-center justify-center text-black cursor-pointer"
              onClick={() => {
                imageRef.current.click();
              }}
            >
              <i className=" bx bx-plus text-5xl "></i>
              <p className="text-2xl">Add a cover photo of your trip</p>
              <p className="text-lg text-stone-600">Image should be less than 10 MB</p>

              <input
                type="file"
                accept="image/*"
                ref={imageRef}
                onChange={handleCoverPhoto}
                className="hidden"
              />
            </div>
          )}

          {coverPhoto? <i className="bx bx-trash text-3xl text-[#EF233C] absolute right-5 top-1/2 -translate-y-1/2 bg-white px-3 py-3 rounded-full cursor-pointer" 
          onClick={()=>setCoverPhoto(null)}
          ></i> : <></>}
        </div>
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2 className="text-3xl font-semibold leckerli text-white"> Tags</h2>

        <div className="w-full flex items-center justify-center flex-wrap gap-5">
          {tags.map((tag, index) => {
            return (
              <span
                key={index}
                className={`py-3 rounded-lg px-3 ${
                  selectedTags.includes(tag)
                    ? "bg-red-400 text-white"
                    : "bg-white text-black "
                } cursor-pointer`}
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((prevTag) => prevTag !== tag)
                      : [...prev, tags[index]]
                  );
                }}
              >
                #{tag}
              </span>
            );
          })}
        </div>
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10">
        <h2 className="text-3xl font-semibold leckerli text-white">
          {" "}
          Travel Estimate budget
        </h2>
        <input
          type="text"
          placeholder="Total Estimated Budget"
          value={budget}
          onChange={handleBudget}
          className="bg-white text-black text-xl px-4 py-3 w-1/2 focus:outline-none rounded-lg "
        />
      </div>
    </div>
  );
};

export default TripCreation;
