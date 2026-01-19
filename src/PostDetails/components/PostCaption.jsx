import React from "react";
import { Link } from "react-router-dom";

const PostCaption = ({ caption, mentions }) => {
  if (!caption) return null;

  // Regex to find @username
  const parts = caption.split(/(@\w+)/g);

  return (
    <div className="px-4 py-3">
      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.startsWith("@")) {
            const username = part.substring(1); // remove @
            // Check if this username exists in mentions
            const mentionedUser = mentions?.find(
              (u) => u.username === username
            );

            if (mentionedUser) {
              return (
                <Link
                  key={index}
                  to={`/profile/${mentionedUser._id}`}
                  className="text-red-500 font-semibold hover:underline"
                >
                  {part}
                </Link>
              );
            }
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    </div>
  );
};

export default PostCaption;
