import React, { useEffect, useMemo, useState } from "react";
import mainApi from "../../Apis/axios";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromStorage } from "../../slices/userSlice";

const ViewNoteTrip = ({ trip, setTrip }) => {
  const { _id , username } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const [ noteBody , setNoteBody ] = useState({
    body:"",
    isPinned:false,
  })
  const [error , setError] = useState("")

  const [showMore, setShowMore] = useState(false);

  const [addNoteModal ,setAddNoteModal] =useState(false)

  let notes = useMemo(() => {
    if (showMore) {
      return trip.notes;
    } else {
      return trip.notes.slice(0, 3);
    }
  }, [showMore, trip.notes]);

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

  const handlePinUnpinNote = async (noteId) => {
    try {
      const result = await mainApi.patch(
        `/api/trips/${trip._id}/notes/${noteId}/pin`
      );

      setTrip({
        ...trip,
        notes: result.data.notes,
      });
    } catch (error) {}
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await mainApi.delete(`/api/trips/${trip._id}/notes/${noteId}`);
      setTrip((prev) => ({
        ...prev,
        notes: prev.notes.filter((note) => note._id !== noteId),
      }));
    } catch (error) {}
  };

  const handleAddNote = async()=>{
    setError("");

    if(noteBody.body.trim() === ""){
      setError("note body should not be empty")
    return;
    }

    try {
      const result = await mainApi.post(`/api/trips/${trip._id}/notes`,noteBody)
      setTrip(prev=>(
        {
          ...prev,
          notes:result.data.notes
        }
      ))
      setAddNoteModal(false)
      setNoteBody({
        body:"",
        isPinned:false,
      })
    } catch (error) {
      
    }
  }

  return (
    <div>
      
        <div className="w-full flex flex-col gap-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100" 
       
        >

        {/* add Note modal show */}

        {
          addNoteModal &&
          <div className="fixed inset-0 w-screen h-screen z-100 bg-black/50"
          onClick={()=>setAddNoteModal(false)}
          >
            <div className="w-fit h-1/2 absolute left-1/2 top-1/2 -translate-1/2 flex items-center justify-center bg-[#edf2f4] rounded-2xl px-3 py-2"
            onClick={(e)=>{
              e.stopPropagation()
            }}
            >

              <div className="w-100 flex flex-col items-center justify-start gap-3">

                <div className="flex items-center justify-start w-full ">
                  <i className="bx bx-plus text-2xl text-red-500"></i>
                  <h3 className="text-red-500 text-xl leckerli">Add a Note</h3>
                </div>
                <input 
                placeholder="add your note"
                value={noteBody.body}
                onChange={(e)=>
                setNoteBody(prev=>(
                  {
                    ...prev,
                    body:e.target.value
                  }
                ))  
                }
                className= {`w-full px-3 py-1 rounded-lg outline-none border-2 border-red-500 ${noteBody.isPinned ? "bg-red-500/70 text-white" : "bg-white text-black"}`}
                />

                {
                  error && <p className="text-sm text-red-500 font-semibold">{error} </p>
                }
                <div className="w-full px-2 py-2 flex items-center justify-center gap-5 flex-wrap">

                <div className="px-3 py-2 flex items-center justify-center gap-2 rounded-lg bg-red-500 text-white cursor-pointer"
                onClick={(e)=>{
                  e.stopPropagation()
                  setNoteBody(prev=>(
                    {
                      ...prev,
                      isPinned:true
                    }
                  ))
                }}
                >
                  <i className="bx bx-pin-alt text-xl text-white"></i>
                  <p className="text-sm font-semibold">Pin the Note </p>
                </div>

                <div className="px-3 py-2 flex items-center justify-center gap-2 rounded-lg bg-gray-400 text-white cursor-pointer"
                onClick={(e)=>{
                  e.stopPropagation()
                  setNoteBody(prev=>(
                    {
                      ...prev,
                      isPinned:false
                    }
                  ))
                }}
                >
                  <i className="bx bx-pin-slash-alt text-xl text-black"></i>
                  <p className="text-sm font-semibold">Unpin the Note </p>
                </div>
                

                </div>

                  {/* createdBy */}
                <div className="flex items-center justify-start gap-4 bg-white w-full px-4 py-2 rounded-lg">
                  <p className="text-sm text-black font-semibold">Created by</p>
                  <p className="text-base text-gray-600"> @{username}  </p>
                </div>


                {/* cancel or add a note */}
                  <div className=" flex items-center justify-center gap-5  w-full px-3 py-2  rounded-lg ">

                    <div className=" flex items-center justify-center gap-2 cursor-pointer bg-white rounded-lg px-3 py-2"
                    onClick={(e)=>{
                      e.stopPropagation();
                      setAddNoteModal(false)
                    }}>
                      <i className=" bx bx-x text-xl text-black"></i>
                      <p className="text-black text-base">Cancel</p>
                    </div>

                    <div className=" flex items-center justify-center gap-2 cursor-pointer bg-red-500 rounded-lg shadow-2xl px-3 py-2"
                    onClick={(e)=>{
                      e.stopPropagation();
                      handleAddNote()
                    }}
                    >
                      <i className=" bx bx-plus-circle text-xl text-white"></i>
                      <p className="text-white text-base">Add</p>
                    </div>
                    
                  </div>
              </div>
            </div>
          </div>
        }


          {/* Header */}
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center justify-center gap-2.5">
              <i className="bx bx-note text-3xl text-red-500"></i>
              <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
              
            </div>

            <div className="px-3 py-2 bg-red-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-2xl" 
            onClick={(e)=>{
              e.stopPropagation()
              setAddNoteModal(true)
            }}
            >
              <i className="bx bx-plus text-2xl text-white"></i>
              <p className="text-base text-white">Add</p>
            </div>
          </div>

          {/* Notes List */}
          <div className="w-full flex flex-col gap-4">

            {/* info */}

          <div className="relative group flex items-start  gap-2 h-fit w-fit">
                <i className="bx bx-info-circle text-xl text-gray-500 cursor-pointer"></i>

                {/* Tooltip */}
            <div
              className=" h-0 group-hover:h-auto hidden
               group-hover:block p-4 rounded-xl shadow-xl 
               bg-white backdrop-blur-xl 
               border border-gray-200 
               opacity-0 scale-0 
               group-hover:opacity-100 group-hover:scale-100 
               transition-all duration-300 z-50 pointer-events-none"
            >
              {/* Arrow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 
                 -translate-y-1/2 w-3 h-3 
                 bg-red-500 border-l border-t border-gray-500 
                 rotate-45"
              ></div>

              <ul className="flex flex-col gap-2 text-gray-600">
                <li className="text-sm leading-snug">
                  • Only Trip Owner and Collaborators can see, add, delete and
                  pin a note
                </li>
                <li className="text-sm leading-snug">
                  • Only Trip Owner and the collaborator who created the note
                  can delete it
                </li>
              </ul>
            </div>
              </div>
            

            {trip?.notes && trip?.notes.length > 0 && notes.map((note) => {
              const isAllowedToDeleteNote =
                note.createdBy._id === _id || trip.user._id === _id;

              return (
                <div
                  key={note._id}
                  className={`w-full group rounded-xl px-4 py-1 relative transition-all duration-300 border ${
                    note.isPinned
                      ? "bg-red-500/10 border-red-500"
                      : "bg-gray-100 border-gray-200"
                  } hover:shadow-md hover:bg-white`}
                  onClick={() => handlePinUnpinNote(note._id)}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-3 w-full cursor-pointer ">
                    {note.isPinned ? (
                      <i className="bx bx-pin-alt text-2xl text-red-500"></i>
                    ) : (
                      <i className="bx bx-pin-slash-alt text-2xl text-gray-500"></i>
                    )}

                    <div className="flex flex-col items-start justify-start gap-0  p-3 rounded-lg  ">
                      {/* Note Body */}
                      <p className="text-gray-800 text-base leading-relaxed">
                        {note.body}
                      </p>

                      <div className=" flex items-center justify-start gap-2  relative">
                        <p className="text-sm text-gray-500">created By</p>
                        <i className="bx bx-user text-xl text-gray-500"></i>
                        <p className="text-sm text-gray-500">
                          @{note.createdBy.username}{" "}
                        </p>

                        <p className="text-xs text-gray-500 ">
                          at {formatAcceptedDate(note.createdAt)}
                        </p>
                      </div>

                      <p className="text-xs text-red-400 opacity-0 group-hover:opacity-100 mt-2 font-semibold">
                        {note.isPinned ? " Click to Unpin" : "Click to Pin"}
                      </p>
                    </div>

                    {/* delete note if allowed */}

                    {isAllowedToDeleteNote && (
                      <div
                        className="w-fit h-fit cursor-pointer px-3 py-3 rounded-full flex items-center justify-center bg-transparent hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 ease-in"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                      >
                        <i className="bx bx-trash  "></i>
                      </div>
                    )}
                  </div>

                  
                </div>
              );
            })}

            {/* set show more */}

            {trip.notes.length > 3 && (
              <div className="w-full px-4 py-2 bg-white text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center gap-3 cursor-pointer"
              onClick={(e)=>{
                e.stopPropagation()
                setShowMore(prev=>!prev)
              }}
              >
                <i
                  className={`bx bx-chevron-${
                    showMore ? "up" : "down"
                  } text-2xl`}
                ></i>
                <p>
                  {showMore
                    ? "Show Less"
                    : `See More(${trip.notes.length - 3})`}{" "}
                </p>
              </div>
            )}
          </div>
        </div>
      
    </div>
  );
};

export default ViewNoteTrip;
