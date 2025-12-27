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
    <div className="w-full flex flex-col gap-12">
      {/* ================= EXPENSES ================= */}
      <section className="flex flex-col gap-6 ">
        <h2 className="text-lg font-semibold text-gray-800">Expenses</h2>

        {expenses.map((exp, index) => (
          <div
            key={index}
            className="relative bg-white p-5 rounded-2xl shadow-lg flex flex-col gap-4"
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="text-black font-semibold text-lg">
                Expense {index + 1}
              </h3>

              <button
                onClick={() => deleteExpense(index)}
                className=" text-red-500 hover:scale-110 transition text-2xl"
              >
                <i className="bx bx-trash" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                placeholder="Expense title"
                value={exp.title}
                onChange={(e) => updateExpense(index, "title", e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
              />

              <input
                type="text"
                placeholder="Amount"
                value={exp.amount}
                onChange={(e) => updateExpense(index, "amount", e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
              />

              <input
                disabled
                value={username}
                className="w-full px-4 py-2 rounded-xl border border-gray-300focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addExpense}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-5 py-2 rounded-full shadow hover:scale-105 transition"
        >
          <i className="bx bx-plus" /> Add Expense
        </button>
      </section>

      <div className="w-full flex flex-col items-start  justify-start gap-3 ">
            <h2 className="text-black font-semibold text-lg"> Estimated Travel Budget</h2>
            <input type="text" value={travelBudget} onChange={handleBudgetChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-white"/>
      </div>

      {/* ================= NOTES ================= */}
      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-800">Notes</h2>

        {notes.map((note, index) => (
          <div
            key={index}
            className="relative bg-white p-5 rounded-2xl shadow-lg flex flex-col gap-4"
          >
            <h3 className="text-black font-semibold text-lg">
              Note {index + 1}
            </h3>
            <textarea
              placeholder="Write a note..."
              value={note.body}
              onChange={(e) => updateNote(index, "body", e.target.value)}
              className="w-full resize-none min-h-28 px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
            />

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                @{username}{" "}
                <span className="text-2xl text-gray-700 p-2"> | </span>{" "}
                {new Date(note.createdAt).toDateString()}
              </span>

              <div className="flex gap-4">
                <button onClick={() => togglePin(index)}>
                  <i
                    className={`bx ${
                      note.isPinned
                        ? "bx-pin-alt text-red-500"
                        : "bx-pin-slash-alt text-gray-500"
                    } text-3xl`}
                  />
                </button>
                <button onClick={() => deleteNote(index)}>
                  <i className="bx bx-trash text-red-500 text-2xl" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addNote}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-5 py-2 rounded-full shadow hover:scale-105 transition"
        >
          <i className="bx bx-plus" /> Add Note
        </button>
      </section>

      {/* ================= TODO ================= */}
      <section className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Todo List</h2>

          <div className="relative group">
            <i className="bx bx-info-circle text-red-500 text-xl cursor-pointer" />

            <div
              className="absolute left-0 top-7 w-64 bg-black text-white text-xs
      rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100
      transition pointer-events-none z-50"
            >
              During trip creation, tasks are assigned to the creator only. Once
              collaborators join the trip, tasks can be assigned to them.
            </div>
          </div>
        </div>

        {todoList.map((todo, index) => (
          <div
            key={index}
            className="relative bg-white p-6 rounded-2xl shadow-xl flex flex-col gap-5 hover:shadow-2xl transition w-full"
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="text-black font-semibold text-lg">
                Todo {index + 1}
              </h3>
              <button
                onClick={() => deleteTodo(index)}
                className="absolute top-4 right-4 text-red-500 text-2xl hover:scale-110 transition"
              >
                <i className="bx bx-trash" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
              <input
                placeholder="Task"
                value={todo.task}
                onChange={(e) => updateTodo(index, "task", e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition "
              />

              <input
                type="date"
                value={new Date(todo.dueDate).toISOString().split("T")[0]}
                onChange={(e) => updateTodo(index, "dueDate", e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition "
              />

              <div
                onClick={() => updateTodo(index, "done", !todo.done)}
                className={`flex items-center gap-3 cursor-pointer select-none
    px-4 py-2 rounded-xl border transition
    ${
      todo.done
        ? "bg-green-50 border-green-400 text-green-700"
        : "bg-gray-50 border-gray-300 text-gray-600 hover:border-red-400"
    }
  `}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center
      border-2 transition
      ${todo.done ? "bg-green-500 border-green-500" : "border-gray-400"}
    `}
                >
                  {todo.done && (
                    <i className="bx bx-check text-white text-lg" />
                  )}
                </div>

                <span className="font-medium text-sm">
                  {todo.done ? "Completed" : "Mark as done"}
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium ">
                {" "}
                Created By {username}
              </p>
              <p className="text-sm text-gray-500 font-medium ">
                {" "}
                Assigned To {username}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={addTodo}
          className="self-start flex items-center gap-2 bg-red-500 text-white
  px-5 py-2 rounded-full shadow hover:scale-105 transition"
        >
          <i className="bx bx-plus" /> Add Todo
        </button>
      </section>
    </div>
  );
};

export default Planning;
