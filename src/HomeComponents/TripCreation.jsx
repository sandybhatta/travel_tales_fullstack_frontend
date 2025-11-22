import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import VisibilityOfPost from "./VisibilityOfPost";
import TagUsers from "./TagUsers";
import Destinations from "./Destinations";
import Expense from "./Expense";
import Notes from "./Notes";
import Todos from "./Todos";
import mainApi from "../Apis/axios";

const TripCreation = ({ setCreationTab }) => {
  const reduxUser = useSelector((state) => state.user);
  const { name, username, avatar, _id } = reduxUser;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [tripDateError, setTripDateError] = useState([]);

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

  const [destinationErrors, setDestinationErrors] = useState([
    {
      cityError: "",
      stateError: "",
      countryError: "",
    },
  ]);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState([
    {
      title: "",
      amount: "",
      spentBy: _id,
      createdAt: new Date(),
    },
  ]);
  const [expenseErrors, setExpenseErrors] = useState([
    {
      titleError: "",
      amountError: "",
    },
  ]);

  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([
    {
      body: "",
      createdAt: new Date(),
      createdBy: _id,
      isPinned: false,
    },
  ]);
  const [noteErrors, setNoteErrors] = useState([
    {
      bodyError: "",
    },
  ]);

  const [todosOpen, setTodosOpen] = useState(false);

  const [todos, setTodos] = useState([
    {
      task: "",
      done: false,
      dueDate: new Date(),
      createdBy: _id,
      assignedTo: _id,
    },
  ]);
  const [todoErrors, setTodoErrors] = useState([
    {
      taskError: "",
    },
  ]);

  const [titleError, setTitleError] = useState("");
  const textRef = useRef(null);
  const imageRef = useRef(null);

  const [selectedTags, setSelectedTags] = useState([]);

  const [apiError, setApiError] = useState(null);
  const apiErrorRef  = useRef() ;

  useEffect(() => {
    textRef.current.style.height = "auto";
    textRef.current.style.height = textRef.current.scrollHeight + "px";
  }, [description]);

  const tags = [
    "adventure",
    "beach",
    "mountains",
    "history",
    "food",
    "wildlife",
    "culture",
    "luxury",
    "budget",
    "road_trip",
    "solo",
    "group",
    "trekking",
    "spiritual",
    "nature",
    "photography",
    "festivals",
    "architecture",
    "offbeat",
    "shopping",
  ];

  const handleTitle = (e) => {
    let text = e.target.value;
    if (text.length <= 100) {
      setTitle(text);
    }
    setTitleError("");
  };
  const handleTitleError = () => {
    if (!title.trim()) {
      setTitleError("Title of the Trip Cannot Be Empty");
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
    let value = e.target.value;

    if (value === "") {
      setBudget("");
      return;
    }

    let filtered = "";
    const digits = "0123456789".split("");

    for (let i = 0; i < value.length; i++) {
      if (digits.includes(value[i])) {
        filtered += value[i];
      }
    }

    setBudget(filtered);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleDate = (value, type) => {
    const errors = [];

    if (value === "") {
      if (type === "startDate") setStartDate(null);
      else setEndDate(null);

      setTripDateError(["Start date and End date must be selected"]);
      return;
    }

    const selectedDate = new Date(value);

    if (type === "startDate") setStartDate(selectedDate);
    else setEndDate(selectedDate);

    let start = type === "startDate" ? selectedDate : startDate;
    let end = type === "endDate" ? selectedDate : endDate;

    if (!start || !end) {
      errors.push("Start date and End date must be selected");
    } else if (start > end) {
      errors.push("Start Date should be before End Date");
    }

    setTripDateError(errors);
  };

  const handleCreateTrip = async () => {
    if (titleError || tripDateError.length > 0) return;
    setApiError("");
  
    const validDestinations = destinations.filter((destination, index) =>
    !destinationErrors[index].cityError &&
    !destinationErrors[index].stateError &&
    !destinationErrors[index].countryError &&
    destination.city.trim() !== "" &&
    destination.state.trim() !== "" &&
    destination.country.trim() !== ""
  );
  
  const validExpenses = expenses.filter((expense, index) =>
    !expenseErrors[index].titleError &&
    !expenseErrors[index].amountError &&
    expense.title.trim() !== "" &&
    Number(expense.amount) >= 0
  );
  
  const validNotes = notes.filter((note, index) =>
    !noteErrors[index].bodyError &&
    note.body.trim() !== ""
  );
  
  const validTodos = todos.filter((todo, index) =>
    !todoErrors[index].taskError &&
    todo.task.trim() !== ""
  );
  
    try {
      const formData = new FormData();
  
      // Basic fields
      formData.append("title", title);
      formData.append("startDate", startDate.toISOString());
      formData.append("endDate", endDate.toISOString());
  
      if (description) formData.append("description", description);
      if (visibilityStatus) formData.append("visibility", visibilityStatus);
      if (Number(budget) > 0) formData.append("travelBudget", Number(budget));
  
      
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => formData.append("tags[]", tag));
      }
  
      // ARRAY FIELDS → SEND AS JSON STRING
      if (validDestinations.length > 0)
        formData.append("destinations", JSON.stringify(validDestinations));
  
      if (validExpenses.length > 0)
        formData.append("expenses", JSON.stringify(validExpenses));
  
      if (validNotes.length > 0)
        formData.append("notes", JSON.stringify(validNotes));
  
      if (validTodos.length > 0)
        formData.append("todoList", JSON.stringify(validTodos));
  
      if (taggedUsers.length > 0)
        formData.append("invitedFriends", JSON.stringify(taggedUsers));
  
      // Photo
      if (coverPhoto) formData.append("coverPhoto", coverPhoto);
  
      // API CALL
      const { data } = await mainApi.post("/api/trips/", formData);
      console.log(data.message);
      setCreationTab("");
  
    } catch (error) {
      const errorResponse = error?.response?.data?.message;
      setApiError(errorResponse);
      if (apiErrorRef.current) {
        apiErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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

      <div className="flex flex-wrap w-auto h-auto gap-5  ">
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
              Invite
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

      {/* api failure message */}

      {apiError && (
        <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10"
        
        >
          <p className="bg-red-500 text-white font-semibold text-3xl px-4 py-3 rounded-lg"
          ref={apiErrorRef}
          >
            {apiError}
          </p>
        </div>
      )}
      {/* title bar */}
      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10">
        <h2 className="text-3xl font-semibold leckerli text-white">
          Title of Your Trip
        </h2>
        <input
          type="text"
          onChange={handleTitle}
          onBlur={handleTitleError}
          value={title}
          className="w-full h-[35px] bg-white text-xl font-semibold border-none px-2 py-7 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
        />
        {titleError && (
          <p className="bg-white text-xl text-red-500 px-3 py-3 rounded-lg">
            {titleError}{" "}
          </p>
        )}
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

      {/* start date and end date */}
      <div className="w-4/5 h-auto flex flex-col items-center justify-center gap-5 mt-10 px-10 relative">
        <h2 className="text-3xl font-semibold leckerli text-white">
          Trip Start and End Date
        </h2>

        <div className="w-full flex  items-center justify-between gap-5 flex-wrap">
          <input
            type="date"
            value={formatDate(startDate)}
            onChange={(e) => handleDate(e.target.value, "startDate")}
            className="px-4 py-3 text-white rounded-lg border border-white shadow-2xl focus:outline-none scale-125"
          />
          <input
            type="date"
            value={formatDate(endDate)}
            onChange={(e) => handleDate(e.target.value, "endDate")}
            className="px-4 py-3 text-white rounded-lg border border-white shadow-2xl focus:outline-none scale-125"
          />

          {tripDateError.map((error, i) => (
            <div
              key={i}
              className="w-full text-red-500 bg-white rounded-lg px-5 py-4 flex flex-col items-center justify-center"
            >
              {error}
            </div>
          ))}
        </div>
      </div>

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2
          className="w-fit text-3xl font-semibold leckerli text-white flex items-center cursor-pointer border px-4 py-4 rounded-lg shadow-xl"
          onClick={() => {
            setDestinationOpen((prev) => !prev);
          }}
        >
          <i className="bx bx-location-plus text-3xl text-white ml-3"></i>
          Add Destinations
          {destinationOpen ? (
            <i className="bx bx-chevron-up text-3xl text-white"></i>
          ) : (
            <i className="bx bx-chevron-down text-3xl text-white"></i>
          )}
        </h2>
        {destinationOpen && (
          <Destinations
            destinations={destinations}
            setDestinations={setDestinations}
            errors={destinationErrors}
            setErrors={setDestinationErrors}
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
              <p className="text-lg text-stone-600">
                Image should be less than 10 MB
              </p>

              <input
                type="file"
                accept="image/*"
                ref={imageRef}
                onChange={handleCoverPhoto}
                className="hidden"
              />
            </div>
          )}

          {coverPhoto ? (
            <i
              className="bx bx-trash text-3xl text-[#EF233C] absolute right-5 top-1/2 -translate-y-1/2 bg-white px-3 py-3 rounded-full cursor-pointer"
              onClick={() => setCoverPhoto(null)}
            ></i>
          ) : (
            <></>
          )}
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
                    ? "bg-[#EF233C] text-white"
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

      {/* create Expenses */}
      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2
          className="text-3xl font-semibold leckerli text-white flex items-center cursor-pointer border px-3 py-5 rounded-xl shadow-2xl relative"
          onClick={() => setExpenseOpen((prev) => !prev)}
        >
          <i className="bx bx-calculator text-3xl"></i>
          Create Expenses
          {expenseOpen ? (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-up text-3xl text-white"></i>
          ) : (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-down text-3xl text-white"></i>
          )}
        </h2>
        {expenseOpen && (
          <Expense
            expenses={expenses}
            setExpenses={setExpenses}
            errors={expenseErrors}
            setErrors={setExpenseErrors}
          />
        )}
      </div>

      {/* create notes */}
      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2
          className="text-3xl font-semibold leckerli text-white flex items-center cursor-pointer border px-3 py-5 rounded-xl shadow-2xl relative"
          onClick={() => setNotesOpen((prev) => !prev)}
        >
          <i className="bx bx-pencil-square text-3xl"></i>
          Create Notes
          {notesOpen ? (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-up text-3xl text-white"></i>
          ) : (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-down text-3xl text-white"></i>
          )}
        </h2>
        {notesOpen && (
          <Notes
            notes={notes}
            setNotes={setNotes}
            errors={noteErrors}
            setErrors={setNoteErrors}
          />
        )}
      </div>

      {/* create todo list */}

      <div className="w-4/5 h-auto flex flex-col gap-5 mt-10 px-10 relative">
        <h2
          className="text-3xl font-semibold leckerli text-white flex items-center cursor-pointer border px-3 py-5 rounded-xl shadow-2xl relative"
          onClick={() => setTodosOpen((prev) => !prev)}
        >
          <i className="bx bx-pencil-square text-3xl"></i>
          Create Todos
          {todosOpen ? (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-up text-3xl text-white"></i>
          ) : (
            <i className="absolute right-5 top-1/2 -translate-y-1/2 bx bx-chevron-down text-3xl text-white"></i>
          )}
        </h2>
        {todosOpen && (
          <Todos
            todos={todos}
            setTodos={setTodos}
            errors={todoErrors}
            setErrors={setTodoErrors}
            userId={_id}
          />
        )}
      </div>

      <div className="w-4/5 h-auto flex items-center justify-center gap-5 mt-10 ">
        <div
          className="w-1/2 bg-green-500 hover:bg-green-400 shadow-2xl text-white text-3xl leckerli text-center px-5 py-4 rounded-lg hover:shadow-3xl relative group overflow-hidden cursor-pointer flex items-center justify-center"
          onClick={handleCreateTrip}
        >
          <p className="relative z-30">Create Trip</p>
          <i className="bx bx-send text-white text-3xl z-30"></i>
          <div className="w-full h-full absolute inset-0  bg-red-400 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-400 ease-in  rounded-lg "></div>
        </div>
      </div>
    </div>
  );
};

export default TripCreation;
