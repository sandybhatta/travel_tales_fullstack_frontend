import React from "react";
import { useSelector } from "react-redux";

const Planning = ({
  expenses,
  setExpenses,
  notes,
  setNotes,
  todoList,
  setTodoList,
  travelBudget,
setTravelBudget
}) => {
  const { _id, username } = useSelector((state) => state.user);

  const addExpense = () => {
    setExpenses([...expenses, { title: "", amount: "", spentBy: _id }]);
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];

    if (field === "amount") {
      if (value === "") {
        updated[index].amount = "";
        setExpenses(updated);
        return;
      }

      if (value.includes("-")) return;

      const dotCount = value.split(".").length - 1;
      if (dotCount > 1) return;

      const num = Number(value);
      if (Number.isNaN(num)) return;

      updated[index].amount = value;
      setExpenses(updated);
      return;
    }

    updated[index][field] = value;
    setExpenses(updated);
  };

  const deleteExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleBudgetChange = (e) =>{
    const value = e.target.value
    if (value === "") {
        
        setTravelBudget(value);
        return;
      }

      if (value.includes("-")) return;

      const dotCount = value.split(".").length - 1;
      if (dotCount > 1) return;

      const num = Number(value);
      if (Number.isNaN(num)) return;

      setTravelBudget(value)
  }
  /* ================= NOTES ================= */

  const addNote = () => {
    setNotes([
      {
        body: "",
        createdBy: _id,
        createdAt: new Date(),
        isPinned: false,
      },
      ...notes,
    ]);
  };

  const updateNote = (index, field, value) => {
    const updated = [...notes];
    updated[index][field] = value;
    setNotes(updated);
  };

  const togglePin = (index) => {
    const updated = [...notes];
    updated[index].isPinned = !updated[index].isPinned;
    updated.sort((a, b) => b.pinned - a.pinned);
    setNotes(updated);
  };

  const deleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  /* ================= TODO ================= */

  const addTodo = () => {
    setTodoList([
      ...todoList,
      {
        task: "",
        dueDate: new Date(),
        done: false,
        createdBy: _id,
        assignedTo: _id,
      },
    ]);
  };

  const updateTodo = (index, field, value) => {
    const updated = [...todoList];

    if (field === "dueDate") {
      updated[index][field] = new Date(value);
      setTodoList(updated);
      return;
    }

    updated[index][field] = value;
    setTodoList(updated);
  };

  const deleteTodo = (index) => {
    setTodoList(todoList.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-12">
      {/* ================= EXPENSES ================= */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Expenses</h2>

        {expenses.map((exp, index) => (
          <div
            key={index}
            className="relative bg-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col gap-3 sm:gap-4"
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="text-black font-semibold text-base sm:text-lg">
                Expense {index + 1}
              </h3>

              <button
                onClick={() => deleteExpense(index)}
                className="text-red-500 hover:scale-110 transition text-xl sm:text-2xl"
              >
                <i className="bx bx-trash" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <input
                placeholder="Expense title"
                value={exp.title}
                onChange={(e) => updateExpense(index, "title", e.target.value)}
                className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-sm sm:text-base"
              />

              <input
                type="text"
                placeholder="Amount"
                value={exp.amount}
                onChange={(e) => updateExpense(index, "amount", e.target.value)}
                className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-sm sm:text-base"
              />

              <input
                disabled
                value={username}
                className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-gray-100 cursor-not-allowed text-sm sm:text-base"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addExpense}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-4 py-2 sm:px-5 rounded-full shadow hover:scale-105 transition text-sm sm:text-base"
        >
          <i className="bx bx-plus" /> Add Expense
        </button>
      </section>

      <div className="w-full flex flex-col items-start justify-start gap-2 sm:gap-3">
        <h2 className="text-black font-semibold text-base sm:text-lg"> Estimated Travel Budget</h2>
        <input
          type="text"
          value={travelBudget}
          onChange={handleBudgetChange}
          className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-white text-sm sm:text-base"
        />
      </div>

      {/* ================= NOTES ================= */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Notes</h2>

        {notes.map((note, index) => (
          <div
            key={index}
            className="relative bg-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col gap-3 sm:gap-4"
          >
            <h3 className="text-black font-semibold text-base sm:text-lg">
              Note {index + 1}
            </h3>
            <textarea
              placeholder="Write a note..."
              value={note.body}
              onChange={(e) => updateNote(index, "body", e.target.value)}
              className="w-full resize-none min-h-24 sm:min-h-28 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-sm sm:text-base"
            />

            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
              <span>
                @{username}{" "}
                <span className="text-lg sm:text-2xl text-gray-700 p-1 sm:p-2"> | </span>{" "}
                {new Date(note.createdAt).toDateString()}
              </span>

              <div className="flex gap-3 sm:gap-4">
                <button onClick={() => togglePin(index)}>
                  <i
                    className={`bx ${
                      note.isPinned
                        ? "bx-pin-alt text-red-500"
                        : "bx-pin-slash-alt text-gray-500"
                    } text-2xl sm:text-3xl`}
                  />
                </button>
                <button onClick={() => deleteNote(index)}>
                  <i className="bx bx-trash text-red-500 text-xl sm:text-2xl" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addNote}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-4 py-2 sm:px-5 rounded-full shadow hover:scale-105 transition text-sm sm:text-base"
        >
          <i className="bx bx-plus" /> Add Note
        </button>
      </section>

      {/* ================= TODO ================= */}
      <section className="flex flex-col gap-4 sm:gap-6 w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Todo List</h2>

          <div className="relative group">
            <i className="bx bx-info-circle text-red-500 text-lg sm:text-xl cursor-pointer" />

            <div
              className="absolute left-0 top-6 sm:top-7 w-48 sm:w-64 bg-black text-white text-[10px] sm:text-xs
      rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100
      transition pointer-events-none z-50 shadow-xl"
            >
              During trip creation, tasks are assigned to the creator only. Once
              collaborators join the trip, tasks can be assigned to them.
            </div>
          </div>
        </div>

        {todoList.map((todo, index) => (
          <div
            key={index}
            className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col gap-4 sm:gap-5 hover:shadow-2xl transition w-full"
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="text-black font-semibold text-base sm:text-lg">
                Todo {index + 1}
              </h3>
              <button
                onClick={() => deleteTodo(index)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-500 text-xl sm:text-2xl hover:scale-110 transition"
              >
                <i className="bx bx-trash" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center w-full">
              <input
                placeholder="Task"
                value={todo.task}
                onChange={(e) => updateTodo(index, "task", e.target.value)}
                className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-sm sm:text-base"
              />

              <input
                type="date"
                value={new Date(todo.dueDate).toISOString().split("T")[0]}
                onChange={(e) => updateTodo(index, "dueDate", e.target.value)}
                className="w-full px-3 py-2 sm:px-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-sm sm:text-base"
              />

              <div
                onClick={() => updateTodo(index, "done", !todo.done)}
                className={`flex items-center gap-3 cursor-pointer select-none
    px-3 py-2 sm:px-4 rounded-xl border transition
    ${
      todo.done
        ? "bg-green-50 border-green-400 text-green-700"
        : "bg-gray-50 border-gray-300 text-gray-600 hover:border-red-400"
    }
  `}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center
      border-2 transition
      ${todo.done ? "bg-green-500 border-green-500" : "border-gray-400"}
    `}
                >
                  {todo.done && <i className="bx bx-check text-white text-sm sm:text-lg" />}
                </div>

                <span className="font-medium text-xs sm:text-sm">
                  {todo.done ? "Completed" : "Mark as done"}
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-500 font-medium ">
                {" "}
                Created By {username}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium ">
                {" "}
                Assigned To {username}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={addTodo}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-4 py-2 sm:px-5 rounded-full shadow hover:scale-105 transition text-sm sm:text-base"
        >
          <i className="bx bx-plus" /> Add Todo
        </button>
      </section>
    </div>
  );
};

export default Planning;
