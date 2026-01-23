import React, { useEffect, useMemo, useState } from "react";
import mainApi from "../../Apis/axios";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromStorage } from "../../slices/userSlice";
import { Link } from "react-router-dom";

const ViewNoteTrip = ({ trip, setTrip, isModal = false }) => {
  const { _id, username, name, avatar } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [noteBody, setNoteBody] = useState({
    body: "",
    isPinned: false,
  });
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [addNoteModal, setAddNoteModal] = useState(false);
  
  // Loading states
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  
  // Throttling state for pin/unpin
  const [processingNotes, setProcessingNotes] = useState(new Set());

  let notes = useMemo(() => {
    if (showMore || isModal) {
      return trip.notes;
    } else {
      return trip.notes.slice(0, 3);
    }
  }, [showMore, trip.notes, isModal]);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const formatAcceptedDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchNotes = async () => {
    setIsFetchingNotes(true);
    try {
      const response = await mainApi.get(`/api/trips/${trip._id}/notes`);
      setTrip((prev) => ({
        ...prev,
        notes: response.data.notes,
      }));
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setIsFetchingNotes(false);
    }
  };

  const handlePinUnpinNote = async (noteId) => {
    // Throttling check
    if (processingNotes.has(noteId)) return;

    // Add to processing set
    setProcessingNotes((prev) => new Set(prev).add(noteId));

    const previousNotes = [...trip.notes];

    // Optimistic Update
    const updatedNotes = trip.notes.map((note) => {
      if (note._id === noteId) {
        return { ...note, isPinned: !note.isPinned };
      }
      return note;
    });

    // Sort optimistically: Pinned first, then by Date
    updatedNotes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setTrip({
      ...trip,
      notes: updatedNotes,
    });

    try {
      const result = await mainApi.patch(
        `/api/trips/${trip._id}/notes/${noteId}/pin`
      );

      // Update with server response
      setTrip((prev) => ({
        ...prev,
        notes: result.data.notes,
      }));
    } catch (error) {
      // Rollback on error
      console.error("Failed to pin/unpin note", error);
      setTrip({ ...trip, notes: previousNotes });
    } finally {
      // Remove from processing set
      setProcessingNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    // 1. Optimistic Update: Store previous state for rollback
    const previousNotes = [...trip.notes];

    // 2. Immediately remove the note from UI
    setTrip((prev) => ({
      ...prev,
      notes: prev.notes.filter((note) => note._id !== noteId),
    }));

    try {
      // 3. Call API
      await mainApi.delete(`/api/trips/${trip._id}/notes/${noteId}`);
      // Success: Do nothing, UI is already updated
    } catch (error) {
      console.error("Failed to delete note", error);
      // 4. Rollback on failure: Restore previous notes
      setTrip((prev) => ({
        ...prev,
        notes: previousNotes,
      }));
    }
  };

  const handleAddNote = async () => {
    setError("");

    if (noteBody.body.trim() === "") {
      setError("Note content cannot be empty");
      return;
    }

    if (isAddingNote) return; // Throttling

    setIsAddingNote(true);

    try {
      await mainApi.post(
        `/api/trips/${trip._id}/notes`,
        noteBody
      );
      
      // Close modal immediately after success
      setAddNoteModal(false);
      setNoteBody({
        body: "",
        isPinned: false,
      });

      // Then fetch updated notes
      await fetchNotes();

    } catch (error) {
      console.error("Failed to add note", error);
      setError(error.response?.data?.message || "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Shimmer Component
  const NoteShimmer = () => (
    <div className="w-full bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded"></div>
        <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div>
      <div
        className={`w-full flex flex-col gap-5 p-4 bg-white ${
          isModal ? "" : "rounded-2xl shadow-sm border border-gray-100"
        }`}
      >
        {/* Add Note Modal */}
        {addNoteModal && (
          <div
            className="fixed inset-0 w-screen h-screen z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !isAddingNote && setAddNoteModal(false)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <i className="bx bx-edit text-2xl text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Create New Note</h3>
                </div>
                <button 
                    onClick={() => !isAddingNote && setAddNoteModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    disabled={isAddingNote}
                >
                    <i className="bx bx-x text-2xl"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-6">
                
                {/* User Info */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <img 
                        src={avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt={username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">{name || "Traveler"}</span>
                        <span className="text-xs text-gray-500 font-medium">@{username}</span>
                    </div>
                    <div className="ml-auto px-3 py-1 bg-white rounded-lg border border-gray-200 shadow-sm text-xs font-semibold text-gray-500">
                        Author
                    </div>
                </div>

                {/* Text Area */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Note Content</label>
                    <div className="relative">
                        <textarea
                            placeholder="What's on your mind? Share details, reminders, or ideas for the trip..."
                            rows={5}
                            value={noteBody.body}
                            onChange={(e) =>
                                setNoteBody((prev) => ({
                                ...prev,
                                body: e.target.value,
                                }))
                            }
                            disabled={isAddingNote}
                            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-semibold px-2 animate-pulse">
                            <i className='bx bx-error-circle'></i>
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    {/* Pin Toggle */}
                    <div 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all select-none border-2 ${
                            noteBody.isPinned 
                            ? "bg-red-50 border-red-200" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => !isAddingNote && setNoteBody(prev => ({...prev, isPinned: !prev.isPinned}))}
                    >
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${noteBody.isPinned ? "bg-red-500" : "bg-gray-300"}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${noteBody.isPinned ? "left-5" : "left-1"}`}></div>
                        </div>
                        <span className={`text-sm font-semibold ${noteBody.isPinned ? "text-red-600" : "text-gray-500"}`}>
                            {noteBody.isPinned ? "Pinned to top" : "Pin this note"}
                        </span>
                    </div>

                    {/* Add Button */}
                    <button
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${
                            isAddingNote 
                            ? "bg-red-400 cursor-not-allowed" 
                            : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-xl"
                        } text-white`}
                        onClick={handleAddNote}
                        disabled={isAddingNote}
                    >
                        {isAddingNote ? (
                            <>
                                <i className='bx bx-loader-alt bx-spin text-xl'></i>
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <i className='bx bx-plus-circle text-xl'></i>
                                <span>Add Note</span>
                            </>
                        )}
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`w-full flex items-center ${
            isModal ? "justify-end" : "justify-between"
          } gap-3`}
        >
          {!isModal && (
            <div className="flex items-center justify-center gap-2.5">
              <i className="bx bx-note text-3xl text-red-500"></i>
              <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
            </div>
          )}

          <div
            className="px-4 py-2 bg-red-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setAddNoteModal(true);
            }}
          >
            <i className="bx bx-plus text-xl text-white"></i>
            <p className="text-sm font-semibold text-white">Add Note</p>
          </div>
        </div>

        {/* Notes List */}
        <div className="w-full flex flex-col gap-4">
          {/* Static Info Box */}
          <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
            <i className="bx bx-info-circle text-2xl text-red-500 mt-0.5 flex-shrink-0"></i>
            <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-red-800">Note Permissions</h4>
                <ul className="text-xs text-red-700 space-y-1 list-disc font-semibold list-inside">
                    <li>Only Trip Owner and Collaborators can see, add, delete, and pin notes.</li>
                    <li>Only the Trip Owner and the creator can delete a specific note.</li>
                </ul>
            </div>
          </div>

          {isFetchingNotes ? (
            // Shimmer Loading State
            <div className="flex flex-col gap-4 w-full">
               <NoteShimmer />
               <NoteShimmer />
               <NoteShimmer />
            </div>
          ) : (
            // Actual Notes List
            <>
              {trip?.notes &&
                trip?.notes.length > 0 &&
                notes.map((note) => {
                  const isAllowedToDeleteNote =
                    note.createdBy?._id === _id || trip.user._id === _id;

                  const isProcessing = processingNotes.has(note._id);

                  return (
                    <div
                      key={note._id}
                      className={`w-full group bg-white rounded-2xl p-5 border transition-all duration-300 relative ${
                        note.isPinned
                          ? "border-red-200 shadow-sm ring-1 ring-red-50"
                          : "border-gray-100 hover:border-red-100 hover:shadow-md"
                      } ${isProcessing ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                      onClick={() => !isProcessing && handlePinUnpinNote(note._id)}
                    >
                      {/* Pin Status Indicator (Corner) */}
                      <div className="absolute top-4 right-4 transition-transform duration-300 group-hover:scale-110">
                        <i className={`bx ${note.isPinned ? 'bxs-pin text-red-500' : 'bx-pin text-gray-300 group-hover:text-red-400'} text-2xl`}></i>
                      </div>

                      {/* Header: Avatar & Info */}
                      <div className="flex items-center gap-3 mb-3 pr-8">
                         <Link 
                            to={`/profile/${note.createdBy?._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex-shrink-0"
                         >
                            <img 
                                src={note.createdBy?.avatar?.url || note.createdBy?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                alt={note.createdBy?.username}
                                className="w-10 h-10 rounded-full object-cover border border-gray-100"
                            />
                         </Link>
                         <div className="flex flex-col">
                            <Link 
                                to={`/profile/${note.createdBy?._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-bold text-gray-800 hover:underline"
                            >
                                {note.createdBy?.name || note.createdBy?.username || "Unknown User"}
                            </Link>
                            <p className="text-xs text-gray-500">{formatAcceptedDate(note.createdAt)}</p>
                         </div>
                      </div>

                      {/* Note Body */}
                      <div className="w-full">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {note.body}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                         <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${note.isPinned ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                {note.isPinned ? 'Pinned Note' : 'Standard Note'}
                            </span>
                         </div>

                        {isAllowedToDeleteNote && (
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note._id);
                            }}
                            title="Delete Note"
                          >
                            <i className="bx bx-trash text-lg"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* set show more */}

              {!isModal && trip.notes.length > 3 && (
                <div
                  className="w-full px-4 py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore((prev) => !prev);
                  }}
                >
                  <p>
                    {showMore ? "Show Less" : `See More (${trip.notes.length - 3})`}
                  </p>
                  <i
                    className={`bx bx-chevron-${
                      showMore ? "up" : "down"
                    } text-xl`}
                  ></i>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNoteTrip;
