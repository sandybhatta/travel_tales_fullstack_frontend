import React, { useEffect, useState } from "react";

const Todos = ({ todos, setTodos, errors, setErrors, userId }) => {
  const [infoOpen, setInfoOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleTodo = (e, i, type) => {
    const updatedTodo = [...todos];

    if (type === "done") {
      updatedTodo[i].done = e.target.checked;
    } else if (type === "dueDate") {
      const value = e.target.value;
      if(!value){
        updatedTodo[i].dueDate = null;
      }
      else{
        updatedTodo[i].dueDate = new Date(value);
      }
    } else {
      updatedTodo[i][type] = e.target.value;
    }

    setTodos(updatedTodo);
  };

  const addTodo = () => {
    setTodos([
      ...todos,
      {
        task: "",
        done: false,
        dueDate: new Date(),
        createdBy: userId,
        assignedTo: userId,
      },
    ]);

    setErrors((prev) => [...prev, { taskError: "" }]);
  };

  const handleRemoveTodo = (index) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateTodos = () => {
    const newErrors = todos.map((t) => ({
      taskError: t.task.trim() ? "" : "Task in Todo should not be empty",
    }));
    setErrors(newErrors);
  };

  return (
    <div className="text-white w-full flex flex-col items-center relative">
      <div
        className="relative -left-1/2 translate-x-1/2 px-4 py-2 text-sm border shadow-lg cursor-pointer mb-8 rounded-lg flex items-center"
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        {infoOpen ? "Hide" : "Info"}
        <i className={`bx bx-caret-${infoOpen ? "up" : "down"} text-xl`} />
      </div>

      {infoOpen && (
        <ul className="border px-5 py-5 rounded-lg shadow-2xl mb-5">
          <li className="flex item-center justify-center mb-5">
            <i className="bx bx-info-circle text-xl" />
            After the user accepts your trip invitation they become a collaborator.
          </li>
          <li className="flex item-center justify-center">
            <i className="bx bx-info-circle text-xl" />
            You can assign todos only to collaborators and yourself.
          </li>
        </ul>
      )}

      <div className="w-full flex flex-col items-center justify-center gap-8">
        {todos.map((todo, i) => (
          <div
            className="flex flex-col items-center justify-center w-full gap-8 relative"
            key={i}
          >
            <i
              className="bx bx-trash absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-red-500 bg-white px-3 py-3 rounded-lg"
              onClick={() => handleRemoveTodo(i)}
            ></i>

            <h2 className="text-2xl font-semibold text-center">Todo {i + 1}</h2>

            <input
              type="text"
              value={todo.task}
              placeholder="Task..."
              className="bg-[#EDF2F4] px-3 py-4 rounded-lg text-xl font-semibold text-black"
              onChange={(e) => handleTodo(e, i, "task")}
              onBlur={validateTodos}
            />

            {errors[i]?.taskError && (
              <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].taskError}
              </p>
            )}

            <label htmlFor={`todoDone-${i}`} className="text-lg flex items-center gap-2 cursor-pointer ">
              Mark Todo {i + 1} as Done
              <input
                type="checkbox"
                className=" scale-150 accent-red-500  mr-5"
                id={`todoDone-${i}`}
                checked={todo.done}
                onChange={(e) => handleTodo(e, i, "done")}
              />
            </label>

            <input
              type="date"
              value={formatDate(todo.dueDate)}
              onChange={(e) => handleTodo(e, i, "dueDate")}
              className="px-4 py-3  rounded-lg border border-white shadow-2xl focus:outline-none scale-125"
            />

            <p className="bg-white text-black border rounded-lg px-4 py-3">
              Created By & Assigned to You
            </p>
          </div>
        ))}
      </div>

      <div
        className="bg-green-500 px-5 py-4 rounded-lg shadow-xl text-2xl flex items-center justify-center gap-3 cursor-pointer mt-5"
        onClick={addTodo}
      >
        <i className="bx bx-plus-circle text-3xl text-white"></i>
        <p>Add more Todos</p>
      </div>
    </div>
  );
};

export default Todos;
