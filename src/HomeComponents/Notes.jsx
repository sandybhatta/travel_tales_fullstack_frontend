import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const Notes = ({ notes, setNotes, errors, setErrors }) => {
  const bodyRef = useRef([]);
  const { _id } = useSelector((state) => state.user);

  const handleChange = (e, i) => {
    const value = e.target.value;
    const updatedNote = [...notes];
    updatedNote[i]["body"] = value;
    setNotes([...updatedNote]);
  };

  const setIsPinned = (i) => {
    const updatedNotes = [...notes];
    updatedNotes[i]["isPinned"] = !updatedNotes[i].isPinned;
    setNotes(updatedNotes);
  };

  useEffect(() => {
    notes.forEach((_,i)=>{
        const el = bodyRef.current[i]
        if(el){
            el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
        }
    })
    
  }, [notes]);

  useEffect(() => {
    const newErrors = notes.map((note) => ({ bodyError: "" }));
    notes.forEach((note, i) => {
      if (!note.body.trim()) {
        newErrors[i].bodyError = "Note Body cannot be empty";
      }
    });
    setErrors(newErrors);
  }, [notes]);

  const addNote = () => {
    setNotes((prev) => [
      ...prev,
      {
        body: "",
        createdAt: new Date(),
        createdBy: _id,
        isPinned: false,
      },
    ]);
    setErrors((prev) => [...prev, { bodyError: "" }]);
  };


const removeNote = (index)=>{
    setNotes(prev=>prev.filter((_,i)=> i !== index))
    setErrors(prev=>prev.filter((_,i)=> i !== index))
}


  return (
    <div className="text-white mt-5 w-full flex flex-col items-center   ">
      {notes.map((note, i) => {
        return (
          <div
            key={i}
            className="w-full flex flex-col items-center justify-between gap-8 px-5 relative"
          >
            <h2 className="text-3xl font-semibold"> Note {i + 1} </h2>
            <div className="w-full flex items-center justify-between  flex-wrap relative">
              <textarea
              placeholder="Make your notes for trip"
                ref={el=>bodyRef.current[i]=el}
                value={note.body}
                onChange={(e) => handleChange(e, i)}
                className="resize-none bg-white text-black text-xl w-3/4 rounded-xl px-4 py-3 mb-6 "
              />
              {errors[i].bodyError && (
                <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                  {errors[i].bodyError}
                </p>
              )}

              <span
                className="bg-white px-2 py-3 rounded-lg hover:shadow-lg  cursor-pointer"
                onClick={() => {
                  setIsPinned(i);
                }}
              >
                {note.isPinned ? (
                  <i className="bx bx-pin-alt flex items-center text-xl text-red-500 bg-white/400 rounded-lg ">
                    Pinned
                  </i>
                ) : (
                  <i className="bx bx-pin-slash-alt flex items-center text-xl text-red-500 bg-white/400 rounded-lg ">
                    Unpinned
                  </i>
                )}
              </span>
              <i className=" bx bx-trash text-2xl text-red-500 bg-white px-2 py-2 rounded-lg cursor-pointer"
              onClick={()=>removeNote(i)}
              ></i>
            </div>
            <p className="text-sm text-white ">
              {note.createdAt.toDateString()}
            </p>
          </div>
        );
      })}

      <div
        className="bg-green-500 px-5 py-4 rounded-lg shadow-xl text-2xl flex items-center justify-center gap-3 cursor-pointer mt-5"
        onClick={() => {
          addNote();
        }}
      >
        <i className="bx bx-plus-circle text-3xl text-white"></i>
        <p>Add more Notes</p>
      </div>
    </div>
  );
};

export default Notes;
