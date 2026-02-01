import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  useAddTripTodoMutation,
  useToggleTripTodoMutation,
  useDeleteTripTodoMutation,
} from "../../slices/tripApiSlice";

const ViewTodoTrip = ({ trip, setTrip, isModal = false, onTripUpdate }) => {
  const [showMore, setShowMore] = useState(false);
  const [addTodoModal, setAddTodoModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  const { _id, username, name, avatar } = useSelector((state) => state.user);

  const [error, setError] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [processingTodos, setProcessingTodos] = useState(new Set());

  // RTK Query Mutations
  const [addTripTodo] = useAddTripTodoMutation();
  const [toggleTripTodo] = useToggleTripTodoMutation();
  const [deleteTripTodo] = useDeleteTripTodoMutation();

  const [todo, setTodo] = useState({
    task: "",
    dueDate: new Date(),
    assignedTo: {
      _id: _id,
      username: username,
      avatar: avatar,
      name: name
    },
  });

  const handleAddTodo = async () => {
    setError("");
    if (todo.task.trim() === "") {
      setError("Task description cannot be empty");
      return;
    }

    if (isAddingTodo) return;
    setIsAddingTodo(true);

    const addTodoPayload = {
      task: todo.task,
      dueDate: todo.dueDate,
      assignedTo: todo.assignedTo._id,
      tripId: trip._id,
    };

    try {
      await addTripTodo(addTodoPayload).unwrap();
      
      setTodo({
        task: "",
        dueDate: new Date(),
        assignedTo: {
          _id: _id,
          username: username,
          avatar: avatar,
          name: name
        },
      });

      setAddTodoModal(false);
      // No need to fetchTodos, cache invalidation handles it
    } catch (error) {
      setError(error?.data?.message || "Something went wrong");
    } finally {
        setIsAddingTodo(false);
    }
  };

  useEffect(() => {
    if (_id && username) {
        // Init logic if needed
    }
  }, [_id, username]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  
  const formatTime = (date) => {
      return new Date(date).toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
      })
  }

  const handleToggleTodo = async (todoId) => {
    if (processingTodos.has(todoId)) return;

    setProcessingTodos((prev) => new Set(prev).add(todoId));

    // Optimistic Update is handled by RTK Query if we configured it, 
    // or we can rely on fast re-fetch. 
    // For manual optimistic UI here (complex due to props), we might just wait for invalidation.
    // But let's try to be responsive.
    
    try {
      await toggleTripTodo({ tripId: trip._id, todoId }).unwrap();
    } catch (error) {
       console.error("Toggle failed", error);
    } finally {
        setProcessingTodos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(todoId);
            return newSet;
        });
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
        await deleteTripTodo({ tripId: trip._id, todoId }).unwrap();
    } catch (error) {
        console.error("Delete failed", error);
    }
  };

  // Shimmer Component
  const TodoShimmer = () => (
    <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 animate-pulse flex items-start gap-4">
      <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="flex gap-4 mt-2">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const todoList = useMemo(() => {
    if (!trip?.todoList) return [];
    if (showMore || isModal) {
      return trip.todoList;
    } else {
      return trip.todoList.slice(0, 3);
    }
  }, [showMore, trip?.todoList, isModal]);

  return (
    <div
      className={`w-full flex flex-col gap-5 p-4 bg-white ${
        isModal ? "" : "rounded-2xl shadow-sm border border-gray-100"
      }`}
    >
      {addTodoModal && (
        <div
          className="fixed inset-0 w-screen h-screen z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !isAddingTodo && setAddTodoModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <i className="bx bx-task text-2xl text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Add New Task</h3>
                </div>
                <button 
                    onClick={() => !isAddingTodo && setAddTodoModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    disabled={isAddingTodo}
                >
                    <i className="bx bx-x text-2xl"></i>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
                 {/* User Info (Created By) */}
                 <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <img 
                        src={avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt={username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">{name || "You"}</span>
                        <span className="text-xs text-gray-500 font-medium">Creator • @{username}</span>
                    </div>
                </div>

                {/* Task Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Task Description</label>
                    <textarea
                        placeholder="What needs to be done?"
                        rows={3}
                        value={todo.task}
                        onChange={(e) => setTodo((prev) => ({ ...prev, task: e.target.value }))}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all resize-none text-gray-700 placeholder-gray-400 text-sm"
                        disabled={isAddingTodo}
                    />
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-semibold px-2 animate-pulse">
                            <i className='bx bx-error-circle'></i>
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Assigned To Dropdown */}
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-gray-700 ml-1">Assign To</label>
                    <div 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setShowCollaboratorModal(!showCollaboratorModal)}
                    >
                        <div className="flex items-center gap-3">
                             <img 
                                src={todo.assignedTo.avatar?.url || todo.assignedTo.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                alt={todo.assignedTo.username}
                                className="w-8 h-8 rounded-full object-cover"
                             />
                             <span className="text-sm font-medium text-gray-700">
                                {todo.assignedTo.username === username ? `${todo.assignedTo.username} (Me)` : todo.assignedTo.username}
                             </span>
                        </div>
                        <i className={`bx bx-chevron-${showCollaboratorModal ? 'up' : 'down'} text-xl text-gray-500`}></i>
                    </div>

                    {showCollaboratorModal && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 max-h-48 overflow-y-auto animate-slideDown">
                             {/* Me Option */}
                             <div 
                                className="flex items-center gap-3 p-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-50"
                                onClick={() => {
                                    setTodo(prev => ({...prev, assignedTo: { _id, username, avatar, name }}));
                                    setShowCollaboratorModal(false);
                                }}
                             >
                                <img src={avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="w-8 h-8 rounded-full object-cover" alt="me" />
                                <span className="text-sm text-gray-700 font-medium">@{username} (Me)</span>
                             </div>
                             
                             {/* Friends */}
                             {trip.acceptedFriends.map(friend => (
                                 <div 
                                    key={friend.user._id}
                                    className="flex items-center gap-3 p-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                    onClick={() => {
                                        setTodo(prev => ({...prev, assignedTo: { 
                                            _id: friend.user._id, 
                                            username: friend.user.username,
                                            avatar: friend.user.avatar,
                                            name: friend.user.name
                                        }}));
                                        setShowCollaboratorModal(false);
                                    }}
                                 >
                                    <img src={friend.user.avatar?.url || friend.user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="w-8 h-8 rounded-full object-cover" alt={friend.user.username} />
                                    <span className="text-sm text-gray-700 font-medium">@{friend.user.username}</span>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
                
                {/* Due Date */}
                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Due Date</label>
                    <input 
                        type="datetime-local"
                        value={new Date(todo.dueDate).toISOString().slice(0, 16)}
                        onChange={(e) => setTodo(prev => ({...prev, dueDate: new Date(e.target.value)}))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 text-sm text-gray-700"
                    />
                 </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                     <button
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${
                            isAddingTodo 
                            ? "bg-red-400 cursor-not-allowed" 
                            : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-xl"
                        } text-white`}
                        onClick={handleAddTodo}
                        disabled={isAddingTodo}
                    >
                        {isAddingTodo ? (
                            <>
                                <i className='bx bx-loader-alt bx-spin text-xl'></i>
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <i className='bx bx-plus-circle text-xl'></i>
                                <span>Add Task</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full flex items-center ${
          isModal ? "justify-end" : "justify-between"
        } gap-3`}
      >
        {!isModal && (
          <div className="flex items-center justify-center gap-2.5">
            <i className="bx bx-check-square text-3xl text-red-500"></i>
            <h2 className="text-xl font-semibold text-gray-800">Todo List</h2>
          </div>
        )}

        <div
          className="px-4 py-2 bg-red-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            setAddTodoModal(true);
          }}
        >
          <i className="bx bx-plus text-xl text-white"></i>
          <p className="text-sm font-semibold text-white">Add Task</p>
        </div>
      </div>

      {/* Todo List Items */}
      <div className="w-full flex flex-col gap-4">
            <>
                {trip?.todoList &&
                trip?.todoList.length > 0 &&
                todoList.map((todo) => {
                    const isAllowedToDeleteTodo =
                    todo.createdBy?._id === _id || trip.user._id === _id;
                    const isProcessing = processingTodos.has(todo._id);

                    return (
                    <div
                        key={todo._id}
                        className={`w-full group rounded-2xl p-3 md:p-4 border transition-all duration-300 relative cursor-pointer ${
                        todo.done
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-100 hover:border-red-100 hover:shadow-md"
                        } ${isProcessing ? "opacity-60 cursor-wait" : ""}`}
                        onClick={(e) => {
                        e.stopPropagation();
                        if (!isProcessing) handleToggleTodo(todo._id);
                        }}
                    >
                        <div className="flex items-start gap-3 md:gap-4">
                            {/* Checkbox */}
                            <div className="mt-1 flex-shrink-0">
                                <i className={`bx ${todo.done ? 'bxs-checkbox-checked text-red-500' : 'bx-checkbox text-gray-400 group-hover:text-red-400'} text-2xl md:text-3xl transition-colors`}></i>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1 md:gap-2 w-full">
                                {/* Task */}
                                <p className={`text-xs md:text-base font-medium leading-snug ${todo.done ? 'text-gray-500 line-through decoration-red-300' : 'text-gray-800'}`}>
                                    {todo.task}
                                </p>

                                {/* Meta Info Row */}
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 md:mt-2">
                                    {/* Assigned To */}
                                    <div className="flex items-center gap-1 md:gap-2 bg-gray-50 px-1.5 py-1 md:px-2 md:py-1.5 rounded-lg border border-gray-100">
                                        <span className="text-[10px] md:text-xs text-gray-500 font-semibold">Assigned:</span>
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <Link to={`/profile/${todo.assignedTo?._id}`} onClick={e => e.stopPropagation()}>
                                                <img 
                                                    src={todo.assignedTo?.avatar?.url || todo.assignedTo?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                                    alt={todo.assignedTo?.username}
                                                    className="w-5 h-5 md:w-8 md:h-8 rounded-full object-cover shadow-sm border border-white"
                                                />
                                            </Link>
                                            <Link to={`/profile/${todo.assignedTo?._id}`} onClick={e => e.stopPropagation()} className="text-[10px] md:text-xs font-bold text-gray-700 hover:text-red-500">
                                                @{todo.assignedTo?.username}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex items-center gap-1 md:gap-1.5 text-gray-500 bg-gray-50 px-1.5 py-1 md:px-2 md:py-1.5 rounded-lg border border-gray-100">
                                        <i className="bx bx-time-five text-xs md:text-sm"></i>
                                        <span className="text-[10px] md:text-xs font-medium">
                                            {formatDate(todo.dueDate)} • {formatTime(todo.dueDate)}
                                        </span>
                                    </div>

                                    {/* Created By */}
                                    <div className="flex items-center gap-1.5 ml-auto opacity-80 hover:opacity-100 transition-opacity bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                        <span className="text-xs text-gray-400 font-medium">By:</span>
                                        <Link to={`/profile/${todo.createdBy?._id}`} onClick={e => e.stopPropagation()}>
                                            <img 
                                                src={todo.createdBy?.avatar?.url || todo.createdBy?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                                alt={todo.createdBy?.username}
                                                className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                                                title={`Created by @${todo.createdBy?.username}`}
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Delete Button */}
                            {isAllowedToDeleteTodo && (
                                <button
                                    className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTodo(todo._id);
                                    }}
                                    title="Delete Task"
                                >
                                    <i className="bx bx-trash text-lg"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    );
                })}
            </>
        
        {!isModal && trip.todoList.length > 3 && (
          <div
            className="w-full px-4 py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setShowMore((prev) => !prev);
            }}
          >
            <p>
              {showMore ? "Show Less" : `See More (${trip.todoList.length - 3})`}
            </p>
            <i
              className={`bx bx-chevron-${
                showMore ? "up" : "down"
              } text-xl`}
            ></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTodoTrip;
