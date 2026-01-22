import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { searchMentionableUsers } from "../../Apis/userApi";
import { editPost } from "../../Apis/postApi";
import TripSelectionModal from "./TripSelectionModal";

const EditPostModal = ({ post, onClose, onPostUpdate }) => {
  const { _id: currentUserId } = useSelector((state) => state.user);
  const [caption, setCaption] = useState(post.caption || "");

  // Location State
  const [locationCity, setLocationCity] = useState(post.location?.city || "");
  const [locationState, setLocationState] = useState(
    post.location?.state || "",
  );
  const [locationCountry, setLocationCountry] = useState(
    post.location?.country || "",
  );

  const [visibility, setVisibility] = useState(post.visibility || "public");

  // Trip State
  const [trip, setTrip] = useState(null);
  const [tripDay, setTripDay] = useState(post.dayNumber || null);
  const [isHighlighted, setIsHighlighted] = useState(
    post.isHighlighted || false,
  );
  const [showTripModal, setShowTripModal] = useState(false);

  // Tagged Users State
  const [taggedUsers, setTaggedUsers] = useState(post.taggedUsers || []);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagSearchResults, setTagSearchResults] = useState([]);
  const [isSearchingTags, setIsSearchingTags] = useState(false);

  // Mention State
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionResults, setMentionResults] = useState([]);
  const [isSearchingMentions, setIsSearchingMentions] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState(post.mentions || []);

  // Using refs for inputs
  const captionRef = useRef(null);

  // Initial Trip Setup
  useEffect(() => {
    if (post.tripId && typeof post.tripId === "object") {
      setTrip(post.tripId);
    }
  }, [post]);

  // Handle Caption Change (Textarea)
  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length > 1000) return;
    setCaption(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
      setMentionQuery("");
    }
  };

  // Fetch Mentions
  useEffect(() => {
    if (!showMentionList || !mentionQuery) return;

    const timer = setTimeout(async () => {
      setIsSearchingMentions(true);
      try {
        const data = await searchMentionableUsers(mentionQuery);
        setMentionResults(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingMentions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionQuery, showMentionList]);

  const insertMention = (user) => {
    const textarea = captionRef.current;
    const cursorPosition = textarea.selectionStart;

    const before = caption.slice(0, cursorPosition);
    const after = caption.slice(cursorPosition);

    // replace "@query" with "@username "
    const newBefore = before.replace(/@([a-zA-Z0-9_]*)$/, `@${user.username} `);

    setCaption(newBefore + after);

    setMentionedUsers((prev) => {
      if (prev.some((u) => u._id === user._id)) return prev;
      return [...prev, user];
    });

    setShowMentionList(false);
    setMentionQuery("");

    // Focus back
    setTimeout(() => {
      textarea.focus();
      // Ideally set cursor position properly here if needed
    }, 0);
  };

  // Render Styled Caption for Preview
  const renderStyledCaption = (text) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.startsWith("@")) {
        const username = word.slice(1);
        const isMentioned = mentionedUsers.some((u) => u.username === username);
        if (isMentioned) {
          return (
            <span key={index} className="text-red-500 font-semibold">
              {word}
            </span>
          );
        }
      }
      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-blue-500">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  // Tag Search
  useEffect(() => {
    if (!tagSearchQuery) {
      setTagSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingTags(true);
      try {
        const data = await searchMentionableUsers(tagSearchQuery);
        const filtered = (data.users || []).filter(
          (u) => !taggedUsers.some((t) => t._id === u._id),
        );
        setTagSearchResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingTags(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearchQuery, taggedUsers]);

  const handleAddTag = (user) => {
    setTaggedUsers([...taggedUsers, user]);
    setTagSearchQuery("");
  };

  const handleRemoveTag = (userId) => {
    setTaggedUsers(taggedUsers.filter((u) => u._id !== userId));
  };

  const handleSave = async () => {
    const payload = {
      caption,
      location: {
        city: locationCity,
        state: locationState,
        country: locationCountry,
      },
      visibility: trip ? trip.visibility : visibility,
      taggedUsers: taggedUsers.map((u) => u._id),
      mentions: mentionedUsers.map((u) => u._id),
    };

    if (trip) {
      const originalTripId = post.tripId?._id || post.tripId;
      if (trip._id !== originalTripId) {
        payload.tripId = trip._id;
        payload.dayNumber = tripDay;
        payload.isHighlighted = isHighlighted;
      }
    }

    try {
      const response = await editPost(post._id, payload);
      if (onPostUpdate && response.post) {
        onPostUpdate(response.post);
      }
      onClose();
    } catch (error) {
      console.error("Failed to update post", error);
      alert("Failed to update post");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <i className="bx bx-x text-2xl text-gray-600"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Caption Editor */}
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Caption
              </label>
              <span className={`text-xs ${caption.length > 1000 ? "text-red-500" : "text-gray-400"}`}>
                {caption.length}/1000
              </span>
            </div>
            <div className="relative w-full border border-gray-300 rounded-lg overflow-hidden min-h-[120px]">
              {/* Styled Overlay */}
              <div
                className="absolute inset-0 px-4 py-3 bg-white rounded-2xl
             pointer-events-none text-gray-700
             whitespace-pre-wrap break-words overflow-hidden text-sm font-normal leading-[22px]"
              >
                {renderStyledCaption(caption)}
              </div>
              {/* Actual Textarea */}
              <textarea
                ref={captionRef}
                value={caption}
                onChange={handleCaptionChange}
                className= "relative w-full min-h-[120px] px-4 py-3 bg-transparent text-transparent caret-black resize-none outline-none rounded-2xl text-sm font-normal leading-[22px] box-border"
                placeholder="Write something..."
              />
            </div>

            {/* Mention Dropdown */}
            {showMentionList && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg w-64 max-h-48 overflow-y-auto z-20">
                {isSearchingMentions ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Searching...
                  </div>
                ) : (
                  mentionResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => insertMention(user)}
                      className="flex items-center gap-2 p-2 hover:bg-red-50 cursor-pointer"
                    >
                      <img
                        src={user.avatar?.url || user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          @{user.username}
                        </div>
                        <div className="text-xs text-gray-500">{user.name}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <i className="bx bx-location-plus text-xl"></i> Location
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="City"
              />
              <input
                type="text"
                value={locationState}
                onChange={(e) => setLocationState(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="State"
              />
              <input
                type="text"
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Country"
              />
            </div>
          </div>

          {/* Visibility & Trip */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Visibility
              </label>
              {trip ? (
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed border border-gray-200">
                  <i
                    className={`bx bx-${trip.visibility === "public" ? "world" : trip.visibility === "private" ? "lock-alt" : "group"}`}
                  ></i>
                  <span className="capitalize">
                    {trip.visibility.replace("_", " ")}
                  </span>
                  <span className="text-xs ml-auto">(Inherited from Trip)</span>
                </div>
              ) : (
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                  <option value="close_friends">Close Friends</option>
                  <option value="private">Private</option>
                </select>
              )}
            </div>

            {/* Trip Selection Display - Only for Original Posts */}
            {!post.sharedFrom && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-600">
                    Associated Trip
                  </label>
                  <button
                    onClick={() => setShowTripModal(true)}
                    className="text-sm text-red-500 hover:text-red-600 font-bold hover:underline"
                  >
                    Change Trip
                  </button>
                </div>

                {trip ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                    <div className="h-32">
                      <img
                        src={
                          trip.coverPhoto?.url ||
                          "https://via.placeholder.com/800x400?text=No+Cover"
                        }
                        className="w-full h-full object-cover"
                        alt={trip.title}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <h3 className="font-bold text-lg">{trip.title}</h3>
                        <div className="flex items-center gap-2 text-xs opacity-90">
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} -{" "}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                          Day {tripDay}
                        </span>
                        {isHighlighted && (
                          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
                            <i className="bx bxs-star"></i> Highlighted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 bg-gray-50">
                    No trip selected
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tagged Users */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600">
              Tagged Users
            </label>

            <div className="flex flex-wrap gap-2">
              {taggedUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100"
                >
                  <span className="text-sm font-medium">{u.username}</span>
                  <button
                    onClick={() => handleRemoveTag(u._id)}
                    className="hover:text-red-800"
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Search friends to tag..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {tagSearchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                  {isSearchingTags ? (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      Searching...
                    </div>
                  ) : tagSearchResults.length === 0 ? (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      No users found
                    </div>
                  ) : (
                    tagSearchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleAddTag(user)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                      >
                        <img
                          src={user.avatar?.url || user.avatar}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800">
                            {user.username}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Trip Selection Modal */}
      {showTripModal && (
        <TripSelectionModal
          onClose={() => setShowTripModal(false)}
          currentTripId={trip?._id}
          onSelectTrip={(selectedTrip, day, highlighted) => {
            setTrip(selectedTrip);
            setTripDay(day);
            setIsHighlighted(highlighted);
          }}
        />
      )}
    </div>
  );
};

export default EditPostModal;
