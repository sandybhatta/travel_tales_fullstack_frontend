import React, { useState } from "react";
import BasicInfo from "./BasicInfo";
import Details from "./Details";
import Planning from "./Planning";
import Settings from "./Settings";
import { useSelector } from "react-redux";

const TripCreate = ({ setCreationTab, setCreateModal }) => {


    const {_id } = useSelector((state) => state.user);


  const [activeTab, setActiveTab] = useState("basic_info");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [coverPhoto, setCoverPhoto] = useState(null);

  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [destinations, setDestinations] = useState([]);
  const [travelBudget, setTravelBudget] = useState(0);

  const [expenses, setExpenses] = useState([
    {
      title: "",
      amount: "",
      spentBy: _id,
    },
  ]);
  const [notes, setNotes] = useState([{
    body: "",
    createdBy:_id,
    createdAt: new Date(),
    isPinned: false,
  }]);
  const [todoList, setTodoList] = useState([{
    task: "",
    dueDate: new Date(),
    done: false,
    createdBy: _id,
    assignedTo: _id,
  }]);

  const [inviteFriends, setInviteFriends] = useState([]);

  const [error, setError] = useState({
    titleError: "",
    dateError: "",
    coverPhotoError: "",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
    min-h-screen overflow-y-auto
    flex justify-center py-10 px-4"
      onClick={() => {
        setCreationTab("");
        setCreateModal(false);
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#edf2f4] rounded-2xl shadow-2xl
             p-8 flex flex-col gap-6 min-h-screen h-fit z-50 items-center "
        onClick={(e) => e.stopPropagation()}
      >
        {/* headers */}
        <div className="w-full flex items-center justify-between border-b pb-3">
          <div className="flex items-center justify-start gap-3">
            <i className="bx bx-camping text-4xl text-red-500"></i>
            <h2 className="text-2xl font-semibold text-red-500 leckerli">
              Create Trip
            </h2>
          </div>
          <div
            className="flex items-center justify-center cursor-pointer "
            onClick={() => {
              setCreationTab("");
            }}
          >
            <i className="bx bx-x text-3xl text-black" />
          </div>
        </div>

        {/* select tabs */}
        <div className="bg-gray-300 rounded-full px-3 py-1.5 flex items-center justify-between w-full font-semibold border-1 border-white shadow-md hover:shadow-2xl transition-shadow duration-200 ease-in">
          <h3
            className={`cursor-pointer px-5 py-1.5 rounded-full ${
              activeTab === "basic_info"
                ? "bg-red-500 text-white"
                : "text-black"
            }`}
            onClick={() => setActiveTab("basic_info")}
          >
            Basic Info
          </h3>

          <h3
            className={`cursor-pointer px-5 py-1.5 rounded-full ${
              activeTab === "details" ? "bg-red-500 text-white" : "text-black"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </h3>

          <h3
            className={`cursor-pointer px-5 py-1.5 rounded-full ${
              activeTab === "planning" ? "bg-red-500 text-white" : "text-black"
            }`}
            onClick={() => setActiveTab("planning")}
          >
            Planning
          </h3>

          <h3
            className={`cursor-pointer px-5 py-1.5 rounded-full ${
              activeTab === "settings" ? "bg-red-500 text-white" : "text-black"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </h3>
        </div>

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
            inviteFrineds={inviteFriends}
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
    </div>
  );
};

export default TripCreate;
