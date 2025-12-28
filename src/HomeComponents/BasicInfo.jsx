import React, { useEffect, useRef,useState } from "react";
import mainApi from "../Apis/axios";

const BasicInfo = ({
    title,
    setTitle,
    description,
    setDescription,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    coverPhoto,
    setCoverPhoto,
    error,
    setError,
    tags,
    visibility,
    destinations,
    travelBudget,
    expenses,
    notes,
    todoList,
    inviteFriends,
    setCreationTab,
    setCreateModal,
}) => {
  const descriptionRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const coverPhotoRef = useRef(null);

  const [ progress, setProgress] = useState(0)
  const [ isUploading , setIsUploading ] = useState(false)
  const [uploadError , setUploadError] = useState("")

  useEffect(() => {
    descriptionRef.current.style.height = "auto";
    descriptionRef.current.style.height =descriptionRef.current.scrollHeight + "px";
      
  }, [description]);

  const handleTitle = (e) => {
    if (e.target.value.length <= 100) {
      setTitle(e.target.value);
    }
  };

  const handleDescription = (e) => {
    if (e.target.value.length <= 1000) {
      setDescription(e.target.value);
    }
  };
  const formatDateForInput = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const handleEndDate = (e) => {
    const date = new Date(e.target.value);
    if (date >= startDate) {
      setEndDate(date);
    }
  };

  const handleCoverPhoto = (img) => {
    setError((prev) => ({ ...prev, coverPhotoError: "" }));
    if (img.size < 10 * 1024 * 1024) {
      setCoverPhoto(img);
    } else {
      setError((prev) => ({
        ...prev,
        coverPhotoError: "Image should be less than 10MB",
      }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, coverPhotoError: "" }));
      }, 5000);
    }
  };

  const canCreateTrip = () => {
    if (!title.trim()) return false;
    if (!startDate || !endDate) return false;
    if (endDate < startDate) return false;
    return true;
  };


  const handleCreate = async () => {
    const err = {};

    if (!title.trim()) err.titleError = "Title cannot be empty";
    if (!startDate || !endDate || endDate < startDate)
      err.dateError = "Invalid start or end date";

    if (Object.keys(err).length) {
      setError(err);
      setTimeout(
        () => setError({ titleError: "", dateError: "", coverPhotoError: "" }),
        4000
      );
      return;
    }

    const formData = new FormData();

    
    formData.append("title", title.trim());
    formData.append("visibility", visibility);
    formData.append("startDate", startDate.toISOString());
    formData.append("endDate", endDate.toISOString());

    if (description.trim()) {
      formData.append("description", description.trim());
    }

    if (coverPhoto) {
      formData.append("coverPhoto", coverPhoto);
    }

    if (tags.length) {
      formData.append("tags", JSON.stringify(tags));
    }

    const cleanDestinations = destinations
      .filter(
        (d) =>
          d.city.trim() &&
          d.state.trim() &&
          d.country.trim() &&
          !d.error
      )
      .map(({ city, state, country }) => ({ city, state, country }));

    if (cleanDestinations.length) {
      formData.append("destinations", JSON.stringify(cleanDestinations));
    }

    if (travelBudget !== "" && Number(travelBudget) >= 0) {
      formData.append("travelBudget", travelBudget);
    }

    const cleanExpenses = expenses
      .filter((e) => e.title.trim())
      .map((e) => ({
        title: e.title.trim(),
        amount: Number(e.amount),
        spentBy: e.spentBy,
      }));

    if (cleanExpenses.length) {
      formData.append("expenses", JSON.stringify(cleanExpenses));
    }

    const cleanNotes = notes.filter((n) => n.body.trim());
    if (cleanNotes.length) {
      formData.append("notes", JSON.stringify(cleanNotes));
    }

    const cleanTodos = todoList.filter((t) => t.task.trim());
    if (cleanTodos.length) {
      formData.append("todoList", JSON.stringify(cleanTodos));
    }

    if (inviteFriends.length) {
      formData.append(
        "invitedFriends",
        JSON.stringify(inviteFriends.map((u) => u._id))
      );
    }

    try {
      setIsUploading(true);
      setUploadError("");

      await mainApi.post("/api/trips", formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setTimeout(() => {
        setCreateModal(false);
        setCreationTab("");
      }, 1500);
    } catch (err) {
      setUploadError(
        err?.response?.data?.message || "Failed to create trip"
      );
      setTimeout(() => setUploadError(""), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-center gap-7">
      {/* title */}
      <div className=" flex flex-col items-start justify-center gap-3 w-full">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-black font-semibold text-base ">
            Title <span className="text-red-500 text-xl">*</span>
          </h3>
          <p className="text-gray-600 text-sm">{title.length}/100 </p>
        </div>

        <input
          type="text"
          value={title}
          onChange={handleTitle}
          placeholder="Give your trip a memorable title..."
          className="bg-white outline-none rounded-lg shadow-md px-4 py-2 w-full border border-gray-300 focus:border-red-500 focus:outline-none transition-colors duration-200"
        />

        {error.titleError && <p className="text-red-500 font-semibold text-lg"> {error.titleError}</p>}
      </div>

      {/* description */}
      <div className=" w-full flex flex-col items-start justify-center gap-3">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-black font-semibold text-base ">Description</h3>
          <p className="text-gray-600 text-sm">{description.length}/1000 </p>
        </div>
        <textarea
          ref={descriptionRef}
          value={description}
          onChange={handleDescription}
          placeholder="Describe your journey, moments, emotions..."
          className="min-h-60 w-full rounded-lg shadow-md bg-white px-3 py-2 resize-none border border-gray-300 focus:border-red-500 focus:outline-none transition-colors duration-200 h-fit"
        />
      </div>

      {/* start & end date */}

      <div className="w-full flex items-center justify-between flex-wrap">
        <div className=" flex flex-col items-start justify-center gap-3 ">
          <h2 className="text-black font-semibold text-base ">
            Start Date <span className="text-red-500 text-xl">*</span>
          </h2>
          <div
            className="flex items-center justify-center gap-4 bg-white shadow-2xl rounded-lg px-4 py-2 cursor-pointer"
            onClick={() => startDateRef.current.showPicker()}
          >
            <p>
              {" "}
              <span>{startDate.getDate()}</span> -{" "}
              <span>{startDate.getMonth() + 1} </span> -{" "}
              <span>{startDate.getFullYear()} </span>{" "}
            </p>
            <i className=" bx bx-calendar text-red-500 text-3xl" />
          </div>

          <input
            type="date"
            ref={startDateRef}
            value={formatDateForInput(startDate)}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="hidden"
          />
        </div>
        <div className=" flex flex-col items-start justify-center gap-3">
          <h2 className="text-black font-semibold text-base ">
            End Date <span className="text-red-500 text-xl">*</span>
          </h2>
          <div
            className="flex items-center justify-center gap-4 bg-white shadow-2xl rounded-lg px-4 py-2 cursor-pointer"
            onClick={() => endDateRef.current.showPicker()}
          >
            <p>
              {" "}
              <span>{endDate.getDate()}</span> -{" "}
              <span>{endDate.getMonth() + 1} </span> -{" "}
              <span>{endDate.getFullYear()} </span>{" "}
            </p>
            <i className=" bx bx-calendar text-red-500 text-3xl" />
          </div>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            ref={endDateRef}
            onChange={handleEndDate}
            className="hidden"
          />
        </div>
      </div>

      {/* Cover Photo */}
      <h3 className="text-black font-semibold text-base ">Cover Photo</h3>
      <div className="w-full relative group rounded-2xl overflow-hidden shadow-2xl border-3 border-dashed bg-gradient-to-br from-gray-200 to-gray-300">
        {/* Cover Preview */}
        {coverPhoto ? (
          <img
            src={URL.createObjectURL(coverPhoto)}
            alt="cover"
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <i className="bx  bx-arrow-out-up-square-half text-5xl text-red-500"></i>
              <p className="text-gray-500 text-xl font-semibold tracking-wide">
                Add a beautiful cover photo
              </p>
              <p className="text-gray-500 text-lg font-semibold">
                Image size should be less than 10MB
              </p>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
          <button
            onClick={() => coverPhotoRef.current.click()}
            className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition"
          >
            {coverPhoto ? "Change Cover" : "Upload Cover"}
          </button>

          {coverPhoto && (
            <i
              className=" bx bx-x text-3xl text-red-500 bg-white p-3 cursor-pointer absolute top-2 right-3 rounded-full"
              onClick={() => setCoverPhoto(null)}
            />
          )}
        </div>

        {/* Hidden Input */}
        <input
          ref={coverPhotoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCoverPhoto(e.target.files[0])}
        />
      </div>
      {error.coverPhotoError && (
        <p className=" text-xl text-red-500 font-semibold ">
          {error.coverPhotoError}
        </p>
      )}

      <div className="w-full flex items-center justify-end gap-5">
        {/* cancel button */}
        <div
          className="flex items-center justify-center gap-3 px-3 py-1 rounded-lg bg-white cursor-pointer"
          onClick={() => {
            setCreateModal(false);
            setCreationTab("");
          }}
        >
          <i className="bx bx-arrow-left-stroke text-3xl text-black"></i>
          <p className="font-semibold text-black text-xl"> Go Back</p>
        </div>

        {/* create button */}
        <div
          className={`${
            canCreateTrip() ? "cursor-pointer" : "cursor-not-allowed"
          } bg-red-500 rounded-lg flex items-center justify-center gap-3 px-3 py-1`}

          onClick={()=>{canCreateTrip()?handleCreate():undefined}}
        >
          <i className="bx  bx-pencil text-white text-3xl" />
          <p className="font-semibold text-white text-xl"> Create Trip</p>
        </div>
      </div>
      {uploadError && <p className="text-red-500">{uploadError}</p>}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded">
          <div
            style={{ width: `${progress}%` }}
            className="bg-red-500 text-white text-center rounded"
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfo;
