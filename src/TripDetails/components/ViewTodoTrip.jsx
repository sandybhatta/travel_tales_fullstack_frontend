import React, { useEffect, useMemo, useState } from "react";
import mainApi from "../../Apis/axios";
import { useSelector } from "react-redux";

const ViewTodoTrip = ({ trip, setTrip }) => {
  const [showMore, setShowMore] = useState(false);
  const [addTodoModal, setAddTodoModal] = useState(false);
  const [showCollaboratorModal , setShowCollaboratorModal ] = useState(false)
  
  

  const { _id, username } = useSelector((state) => state.user);


  const [ error ,setError] = useState("")
  const [ todo ,setTodo] = useState({
    task : "",
    dueDate : new Date(),
    assignedTo : {
        _id:_id,
        username:username
    }
  })

  
  const handleAddTodo = async()=>{
    setError("")
    if(todo.task.trim()===""){
        setError("task should not be empty")
        return
    }

    const addTodo = {
        ...todo,
        assignedTo:todo.assignedTo._id
    }
    try {
        const result = await mainApi.post(`/api/trips/${trip._id}/todos`,addTodo);
        setTrip(prev=>({
            ...prev,
            todoList:[...prev.todoList,result.data.todo]
        }))

        setTodo({
            task : "",
            dueDate : new Date(),
            assignedTo : {
                _id:_id,
                username:username
            }
        })

        setAddTodoModal(false)
    } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong")
    }



  }

  useEffect(() => {
    if (_id && username) {
      setTodo(prev => ({
        ...prev,
        assignedTo: { _id, username }
      }));
      console.log("todo list" , todo);
    }
  }, [_id, username]);



  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHour = (date) => {
    const hour = new Date(date).getHours();
    return hour % 12 || 12;
  };

  const handleToggleTodo = async (todoId) => {
    try {
      await mainApi.patch(`/api/trips/${trip._id}/todos/${todoId}/toggle`);
      setTrip((prev) => ({
        ...prev,
        todoList: prev.todoList.map((todo) =>
          todo._id === todoId ? { ...todo, done: !todo.done } : todo
        ),
      }));
    } catch (error) {}
  };

  const handleDeleteTodo = async (todoId) => {
     await mainApi.delete(
      `/api/trips/${trip._id}/todos/${todoId}`
    );
    setTrip((prev) => ({
      ...prev,
      todoList: prev.todoList.filter(todo=>todo._id !== todoId )
    }));
  };

  const todoList = useMemo(() => {
    if (showMore) {
      return trip.todoList;
    } else {
      return trip.todoList.slice(0, 3);
    }
  }, [showMore, trip.todoList]);

  return (
    <div className="w-full flex flex-col gap-6 p-5 bg-white rounded-2xl shadow-sm border border-gray-200">




{
  addTodoModal && (
    <div
      className="fixed inset-0 w-screen h-screen z-50 bg-black/50 flex items-center justify-center animate-fadeIn"
      onClick={() => setAddTodoModal(false)}
    >
      <div
        className="w-[90%] max-w-lg bg-[#edf2f4] rounded-2xl shadow-2xl p-6 animate-scaleIn relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <i className="bx bx-plus text-3xl text-red-500"></i>
          <h3 className="text-red-500 text-2xl leckerli">Add a Todo</h3>
        </div>

        {/* Todo Input */}
        <textarea
          placeholder="Write your task..."
          value={todo.task}
          onChange={(e) =>
            setTodo((prev) => ({
              ...prev,
              task: e.target.value,
            }))
          }
          className="w-full px-4 py-3 rounded-lg outline-none border-2 border-red-400 bg-white text-black resize-none shadow-sm focus:ring-2 focus:ring-red-300 transition"
        />

        {error && (
          <p className="text-sm text-red-500 font-semibold mt-1">{error}</p>
        )}

        {/* Created By */}
        <div className="mt-4 w-full bg-white rounded-xl p-4 shadow-inner border border-gray-200">
          <p className="text-sm font-semibold text-black mb-1">Created By</p>
          <p className="text-base text-gray-600 px-2 py-1 rounded-lg bg-gray-100">
            @{username}
          </p>
        </div>

        {/* Assigned To */}
        <div className="mt-4 w-full p-4   ">
          <p className="text-sm font-semibold text-black mb-1">Assigned To</p>

          <div className="w-full bg-gray-100 rounded-lg">
            {/* Selected */}
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setShowCollaboratorModal((prev) => !prev);
              }}
            >
              <p className="text-sm text-black">
                {todo.assignedTo.username}{" "}
                {todo.assignedTo._id === _id && <span className="text-xs">( me )</span>}
              </p>
              <i
                className={`bx bx-chevron-${
                  showCollaboratorModal ? "up" : "down"
                } text-2xl text-black`}
              ></i>
            </div>

            {/* Dropdown */}
            {showCollaboratorModal && (
              <div className="mt-1 flex flex-col w-full gap-1 py-2 animate-slideDown">
                {trip.acceptedFriends.map((friend) => {
                  
                  return (
                    <div
                      key={friend._id}
                      className="px-3 py-2 rounded-lg bg-white hover:bg-red-500 hover:text-white cursor-pointer transition"
                      onClick={() => {
                        setTodo((prev) => ({
                          ...prev,
                          assignedTo: {
                            _id:friend.user._id,
                            username:friend.user.username
                          },
                        }));
                        setShowCollaboratorModal(false);
                      }}
                    >
                      {friend.user.username}{" "}
                      
                    </div>
                  );
                })}
                  <div
                      
                      className="px-3 py-2 rounded-lg bg-white hover:bg-red-500 hover:text-white cursor-pointer transition"
                      onClick={() => {
                        setTodo((prev) => ({
                          ...prev,
                          assignedTo: {
                            _id:_id,
                            username:username
                          },
                        }));
                        setShowCollaboratorModal(false);
                      }}
                    >
                      {username}<span className="text-xs">(me)</span>
                      
                    </div>


                

              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 bg-white text-black border border-gray-400 rounded-lg shadow-sm hover:bg-gray-100 transition"
            onClick={(e) => {
              e.stopPropagation();
              setAddTodoModal(false);
            }}
          >
            Cancel
          </button>

          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleAddTodo();
            }}
          >
            <i className="bx bx-plus-circle text-xl"></i>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}





      <div className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center justify-center gap-2.5">
          <i className="bx bx-check-square text-3xl text-red-500"></i>
          <h2 className="text-xl font-semibold text-gray-800">Todo List</h2>
        </div>

        <div className="px-3 py-2 bg-red-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-2xl" 
        onClick={(e)=>{
            e.stopPropagation();
            setAddTodoModal(true)
        }}
        >
          <i className="bx bx-plus text-2xl text-white"></i>
          <p className="text-base text-white">Add</p>
        </div>
      </div>

      {/* Todo List Items */}
      <div className="w-full flex flex-col gap-4">
        {trip?.todoList &&
          trip?.todoList.length > 0 &&
          todoList.map((todo) => {
            const isAllowedToDeleteTodo =
              todo.createdBy._id === _id || trip.user._id === _id;

            return (
              <div
                key={todo._id}
                className={`w-full flex  items-center justify-between gap-4 p-4  border cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white ${
                  todo.done
                    ? "bg-red-500/10 border-red-500"
                    : "bg-[#edf2f4] border-gray-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTodo(todo._id);
                }}
              >
                {/* Left Section (checkbox + task) */}
                <div className="flex items-center gap-3 w-full justify-between px-2">
                  {/* mark done or not */}
                  <div>
                    {todo.done ? (
                      <i className="bx bx-checkbox-square text-red-500 text-2xl "></i>
                    ) : (
                      <i className="bx bx-checkbox text-black text-2xl "></i>
                    )}
                  </div>

                  {/* task body and assignment */}
                  <div className="flex flex-col items-start justify-center gap-2">
                    {/* task body */}
                    <p
                      className={`relative  text-base ${
                        todo.done
                          ? "text-gray-500 font-semibold line-through"
                          : "text-black"
                      }`}
                    >
                      {todo.task}
                    </p>

                    {/* created by and assigned to */}
                    <div className="flex items-center justify-start gap-2 flex-wrap">
                      {/* created By name */}
                      <div className="flex items-center justify-start gap-2">
                        <i className="bx bx-user-circle text-xl text-black"></i>
                        <p className="text-sm text-gray-800 "> Created by</p>
                        <p className="text-sm text-gray-500 ">
                          {" "}
                          @{todo.createdBy.username}{" "}
                        </p>
                      </div>

                      {/* assigned to */}
                      <div className="flex items-center justify-start gap-2">
                        <i className="bx bx-group text-xl text-black"></i>
                        <p className="text-sm text-gray-800  "> Assigned to</p>
                        <p className="text-sm text-gray-500 ">
                          {" "}
                          @{todo.assignedTo.username}{" "}
                        </p>
                      </div>
                    </div>

                    {/* time */}
                    <div className="flex items-center justify-start gap-2">
                      <i
                        className={` bx bx-clock-${formatHour(
                          todo.dueDate
                        )} text-xl text-black `}
                      ></i>
                      <p className="text-sm text-gray-500 ">
                        Due date: {formatDate(todo.dueDate)}
                      </p>
                    </div>
                  </div>

                  {/* delete todo */}
                  {isAllowedToDeleteTodo && (
                    <div
                      className="w-fit h-fit cursor-pointer px-3 py-3 rounded-full flex items-center justify-center bg-transparent hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 ease-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTodo(todo._id);
                      }}
                    >
                      <i className="bx bx-trash  "></i>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {trip.todoList.length > 3 && (
          <div
            className="w-full px-4 py-2 bg-white text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center gap-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowMore((prev) => !prev);
            }}
          >
            <i
              className={`bx bx-chevron-${showMore ? "up" : "down"} text-2xl`}
            ></i>
            <p>
              {showMore ? "Show Less" : `See More(${trip.todoList.length - 3})`}{" "}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTodoTrip;
