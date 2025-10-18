import React from "react";

const VisibilityOfPost = ({ visibilityStatus, setVisibilityStatus, setVisibilityOpen }) => {
  const options = [
    { label: "Public", value: "public", icon: "bx-community" },
    { label: "Followers Only", value: "followers", icon: "bx-group" },
    { label: "Only Close Friends", value: "close_friends", icon: "bxs-user-check" },
    { label: "Only Me", value: "private", icon: "bx-lock-keyhole" },
  ];

  return (
    <div className="z-20 absolute top-0 left-0 w-[100%] h-[100dvh] bg-[#EF233C]/70 backdrop-blur-2xl flex flex-col justify-around gap-5 border border-white rounded-3xl shadow-md text-white p-5">
      {/* Header */}
      <div className="text-start space-y-6">
        <h2 className="text-5xl leckerli">Set Your Post Visibility</h2>
        <p className="text-white ">Choose who can see your post</p>
        <i className="bx bx-x text-4xl text-white absolute right-10 top-5 cursor-pointer" 
        onClick={()=>setVisibilityOpen(false)}
        ></i>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => setVisibilityStatus(opt.value)}
            className={`w-full h-[70px] flex justify-between items-center px-6 rounded-xl cursor-pointer transition-all duration-300 ${
              visibilityStatus === opt.value ? "bg-white text-black" : "bg-black/30 text-white border border-white/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <i className={`bx ${opt.icon} text-3xl`}></i>
              <p className="text-xl">{opt.label}</p>
            </div>

            {visibilityStatus === opt.value && (
              <i className="bx bx-check-circle text-3xl text-green-500"></i>
            )}
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setVisibilityOpen(false)}
        className="self-center mb-8 px-6 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition"
      >
        Done
      </button>
    </div>
  );
};

export default VisibilityOfPost;
