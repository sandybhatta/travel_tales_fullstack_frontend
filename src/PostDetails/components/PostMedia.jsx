import React from "react";

const PostMedia = ({ media, onMediaClick }) => {
  if (!media || media.length === 0) return null;

  const handleClick = (index, e) => {
    if (onMediaClick) {
      e.preventDefault(); // Prevent navigating if inside a Link
      e.stopPropagation();
      onMediaClick(index);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      {media.length === 1 && (
        <div
          onClick={(e) => handleClick(0, e)}
          className={onMediaClick ? "cursor-pointer" : ""}
        >
          {media[0].resource_type === "image" ? (
            <img
              src={media[0].url}
              alt="content"
              className="w-full h-auto object-contain"
            />
          ) : (
            <video src={media[0].url} controls={!!onMediaClick} className="w-full h-auto" />
          )}
        </div>
      )}
      {media.length === 2 && (
        <div className="grid grid-cols-2 gap-1 h-56 sm:h-64 md:h-96">
          {media.map((file, idx) => (
            <div
              key={idx}
              onClick={(e) => handleClick(idx, e)}
              className={`h-full relative overflow-hidden ${onMediaClick ? "cursor-pointer" : ""}`}
            >
              {file.resource_type === "image" ? (
                <img
                  src={file.url}
                  alt="content"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video src={file.url} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
      {media.length >= 3 && (
        <div className="grid grid-cols-2 gap-1 min-h-56 h-auto md:h-96">
          <div
            onClick={(e) => handleClick(0, e)}
            className={`h-full relative overflow-hidden ${onMediaClick ? "cursor-pointer" : ""}`}
          >
            {media[0].resource_type === "image" ? (
              <img
                src={media[0].url}
                alt="content"
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={media[0].url} className=" h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-1 h-full">
            <div
              onClick={(e) => handleClick(1, e)}
              className={`flex-1 min-h-0 relative w-full overflow-hidden ${onMediaClick ? "cursor-pointer" : ""}`}
            >
              {media[1].resource_type === "image" ? (
                <img
                  src={media[1].url}
                  alt="content"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video src={media[1].url} className="w-full h-full object-cover" />
              )}
            </div>
            <div
              onClick={(e) => handleClick(2, e)}
              className={`flex-1 min-h-0 relative w-full overflow-hidden ${onMediaClick ? "cursor-pointer" : ""}`}
            >
              {media[2].resource_type === "image" ? (
                <img
                  src={media[2].url}
                  alt="content"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video src={media[2].url} className="w-full h-full object-cover" />
              )}
              {media.length > 3 && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {media.length - 3} more images
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostMedia;
