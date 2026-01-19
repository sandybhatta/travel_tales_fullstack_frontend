import React from "react";

const PostMedia = ({ media }) => {
  if (!media || media.length === 0) return null;

  const renderMediaItem = (file, className = "") => {
    const isVideo = file.resource_type === "video";
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isVideo ? (
          <video
            src={file.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={file.url}
            alt="Post content"
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
          />
        )}
      </div>
    );
  };

  // Grid Logic
  if (media.length === 1) {
    return (
      <div className="w-full bg-gray-100">
        {media[0].resource_type === "video" ? (
             <video src={media[0].url} controls className="w-full max-h-[80vh] mx-auto" />
        ) : (
             <img src={media[0].url} alt="content" className="w-full h-auto max-h-[80vh] object-contain bg-black" />
        )}
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 h-96 w-full">
        {renderMediaItem(media[0], "h-full")}
        {renderMediaItem(media[1], "h-full")}
      </div>
    );
  }

  if (media.length >= 3) {
    return (
      <div className="grid grid-cols-2 gap-1 h-96 w-full">
        {/* Left: First Item (Full Height) */}
        <div className="h-full">
            {renderMediaItem(media[0], "h-full")}
        </div>
        
        {/* Right: Split Vertically */}
        <div className="grid grid-rows-2 gap-1 h-full">
            {renderMediaItem(media[1], "h-full")}
            
            <div className="relative h-full">
                {renderMediaItem(media[2], "h-full")}
                
                {/* Overlay if > 3 */}
                {media.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-2xl cursor-pointer hover:bg-black/60 transition">
                        +{media.length - 3} more
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PostMedia;
