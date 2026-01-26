import React, { useState } from "react";
import BasicInfo from "./BasicInfo";
import Details from "./Details";
import Planning from "./Planning";
import Settings from "./Settings";
import { useSelector } from "react-redux";
import mainApi from "../Apis/axios";

const TripCreate = ({ setCreationTab, setCreateModal }) => {
  const { _id } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("basic_info");
  const [createLoading, setCreateLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [coverPhoto, setCoverPhoto] = useState(null);

  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [destinations, setDestinations] = useState([
    { city: "", state: "", country: "", error: "" },
  ]);
  const [travelBudget, setTravelBudget] = useState(0);

  const [expenses, setExpenses] = useState([
    {
      title: "",
      amount: "",
      spentBy: _id,
    },
  ]);
  const [notes, setNotes] = useState([
    {
      body: "",
      createdBy: _id,
      createdAt: new Date(),
      isPinned: false,
    },
  ]);
  const [todoList, setTodoList] = useState([
    {
      task: "",
      dueDate: new Date(),
      done: false,
      createdBy: _id,
      assignedTo: _id,
    },
  ]);

  const [inviteFriends, setInviteFriends] = useState([]);

  const [error, setError] = useState({
    titleError: "",
    dateError: "",
    coverPhotoError: "",
  });

  const steps = ["basic_info", "details", "planning", "settings"];

  const handleNext = () => {
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  };

  const handleCreateTrip = async () => {
    if (!title || !startDate || !endDate) {
      setGlobalError("Please fill in Title, Start Date and End Date in Basic Info.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setGlobalError("Start Date cannot be after End Date.");
      return;
    }

    setCreateLoading(true);
    setGlobalError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("visibility", visibility);
    if (travelBudget) formData.append("travelBudget", travelBudget);

    if (coverPhoto) {
      formData.append("coverPhoto", coverPhoto);
    }

    // Complex fields
    formData.append("tags", JSON.stringify(tags));

    // Filter empty destinations
    const validDestinations = destinations.filter(
      (d) => d.city || d.state || d.country
    );
    if (validDestinations.length > 0)
      formData.append("destinations", JSON.stringify(validDestinations));

    // Expenses
    const validExpenses = expenses.filter((e) => e.title && e.amount);
    if (validExpenses.length > 0)
      formData.append("expenses", JSON.stringify(validExpenses));

    // Notes
    const validNotes = notes.filter((n) => n.body);
    if (validNotes.length > 0)
      formData.append("notes", JSON.stringify(validNotes));

    // Todo
    const validTodos = todoList.filter((t) => t.task);
    if (validTodos.length > 0)
      formData.append("todoList", JSON.stringify(validTodos));

    // Invite Friends
    if (inviteFriends.length > 0)
      formData.append("invitedFriends", JSON.stringify(inviteFriends));

    try {
      await mainApi.post("/api/trips", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreateModal(false);
      setCreationTab("");
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to create trip");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md min-h-screen overflow-y-auto flex justify-center py-4 sm:py-10 px-2 sm:px-4 animate-fadeIn"
      onClick={() => {
        setCreationTab("");
        setCreateModal(false);
      }}
    >
      <div
        className="w-full max-w-4xl bg-[#edf2f4] rounded-2xl sm:rounded-3xl shadow-2xl p-0 flex flex-col min-h-[90vh] sm:min-h-[80vh] h-fit z-50 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-red-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-red-500">
              <i className="bx bx-camping text-2xl sm:text-3xl"></i>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leckerli">Create Trip</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Plan your next adventure</p>
            </div>
          </div>
          <button
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => {
              setCreationTab("");
              setCreateModal(false);
            }}
          >
            <i className="bx bx-x text-2xl sm:text-3xl" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="bg-white px-4 sm:px-8 pb-0 pt-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between sm:justify-start sm:gap-10 min-w-max sm:min-w-0">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`pb-3 sm:pb-4 cursor-pointer relative group ${activeTab === step ? 'text-red-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab(step)}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs border ${activeTab === step ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'}`}>
                    {index + 1}
                  </span>
                  <span className="font-medium capitalize text-xs sm:text-sm">{step.replace('_', ' ')}</span>
                </div>
                {activeTab === step && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[70vh] sm:max-h-[60vh] bg-[#f8f9fa]">
          {activeTab === "basic_info" ? (
            <BasicInfo
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              coverPhoto={coverPhoto}
              setCoverPhoto={setCoverPhoto}
              error={error}
              setError={setError}
              tags={tags}
              visibility={visibility}
              destinations={destinations}
              travelBudget={travelBudget}
              expenses={expenses}
              notes={notes}
              todoList={todoList}
              inviteFriends={inviteFriends}
              setCreationTab={setCreationTab}
              setCreateModal={setCreateModal}
            />
          ) : activeTab === "details" ? (
            <Details
              tags={tags}
              setTags={setTags}
              destinations={destinations}
              setDestinations={setDestinations}
            />
          ) : activeTab === "planning" ? (
            <Planning
              expenses={expenses}
              setExpenses={setExpenses}
              notes={notes}
              setNotes={setNotes}
              todoList={todoList}
              setTodoList={setTodoList}
              travelBudget={travelBudget}
              setTravelBudget={setTravelBudget}
            />
          ) : (
            <Settings
              visibility={visibility}
              setVisibility={setVisibility}
              inviteFriends={inviteFriends}
              setInviteFriends={setInviteFriends}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-4 sm:px-8 py-3 sm:py-5 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 mr-2">
            {globalError && <p className="text-red-500 text-[10px] sm:text-sm font-medium animate-pulse">{globalError}</p>}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleBack}
              disabled={activeTab === "basic_info"}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-xs sm:text-sm ${activeTab === "basic_info" ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Back
            </button>

            {activeTab === "settings" ? (
              <button
                onClick={handleCreateTrip}
                disabled={createLoading}
                className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-white shadow-lg shadow-red-200 transition-all transform active:scale-95 text-xs sm:text-sm ${createLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 hover:shadow-xl'}`}
              >
                {createLoading ? "Creating..." : "Create Trip"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-white bg-gray-800 hover:bg-black shadow-lg transition-all transform active:scale-95 text-xs sm:text-sm"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCreate;
