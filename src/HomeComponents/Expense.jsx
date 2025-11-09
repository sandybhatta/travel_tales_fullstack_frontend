import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Expense = ({ expenses, setExpenses,errors,setErrors }) => {
  const { username ,_id} = useSelector((state) => state.user);

  const [infoOpen, setInfoOpen] = useState(false);

  


  const handleExpense = (e, i) => {
    const { name, value } = e.target;
    const updatedExpense = [...expenses];
    updatedExpense[i][name] = value;
    setExpenses([...updatedExpense]);
  };

  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      {
        title: "",
        amount: "",
        spentBy: _id,
        createdAt: new Date(),
      },
    ]);

    setErrors(prev=>(
        [...prev,{
            titleError: "",
            amountError: "",
          }]
    ))
  };


  const handleRemoveExpense = (index)=>{
    setExpenses(prev=>prev.filter((_,i)=>i!== index))
  }



  const saveExpenses= ()=>{
    const newErrors = expenses.map(expense=>({
        titleError:"",
        amountError:""
    }))

    expenses.forEach((expense,i)=>{
        const {title, amount} =expense

        if(title.trim() === ""){
            newErrors[i].titleError ="Expense Title should not be empty"
        }
        if(amount.trim() === ""){
            newErrors[i].amountError ="Expense amount should not be empty"
        }
        const isAlpha=(char)=>{
            const code = char.charCodeAt(0);
            return (
            (code >= 65 && code <= 90) || 
            (code >= 97 && code <= 122)   
            );
        }

        for (let char of title) {
            if (!isAlpha(char)) {
              newErrors[i].titleError = "Title should only contain letters A-Z";
              
              break;
            }
         }

         let digits = "1234567890"

         for(let num of amount){
            if(!digits.includes(num)){
                newErrors[i].amountError="Amount should be only in 0-9"
            }
            break;
         }
         setErrors(newErrors)
      
    })
  }

  useEffect(()=>{
    saveExpenses()
  },[expenses])

  return (
    <div className="text-white w-full flex flex-col items-center  relative ">
      <div
        className="relative -left-1/2 translate-x-1/2 px-4 py-2 text-sm border shadow-lg cursor-pointer mb-8 rounded-lg flex items-center"
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        {infoOpen ? "Hide" : "Info"}
        {infoOpen ? (
          <i className="bx bx-caret-up text-xl "></i>
        ) : (
          <i className="bx bx-caret-down text-xl "></i>
        )}
      </div>

      {infoOpen && (
        <ul className="border px-5 py-5 rounded-lg shadow-2xl mb-5">
          <li className="flex item-center justify-center mb-5">
            <i className="bx bx-info-circle text-xl "></i>After The User Accepts
            your Trip Invitation They will become the collaborator of this trip
          </li>
          <li className="flex item-center justify-center">
            <i className="bx bx-info-circle text-xl "></i>You can assign expense
            'spentBy' To only the collaborators and yourself
          </li>
        </ul>
      )}

      <div className=" w-full flex flex-col items-center justify-center gap-8 ">
        {expenses.map((expense, i) => (
          <div
          className="flex flex-col items-center justify-center w-full gap-8 relative"
          key={i}>
             <i className="bx bx-trash absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-red-500 bg-white px-3 py-3 rounded-lg"
            onClick={()=>handleRemoveExpense(i)}
            ></i>
            <h2 className="text-2xl font-semibold text-center "> Expense {i+1}</h2>
            <input
              type="text"
              value={expense.title}
              placeholder="Expense Title"
              name="title"
              className="bg-[#EDF2F4] px-3 py-4 rounded-lg focus:offset-none text-xl font-semibold text-black"
              onChange={(e) => {
                handleExpense(e, i);
              }}
            />
            {errors[i].titleError && <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].titleError}
              </p>}

            <input
              type="text"
              placeholder="Amount of this expense"
              name="amount"
              value={expense.amount}
              className="bg-[#EDF2F4] px-3 py-4 rounded-lg focus:offset-none text-xl font-semibold text-black"
              onChange={(e) => {
                handleExpense(e, i);
              }}
            />
            {errors[i].amountError && <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].amountError}
              </p>}

            <p className="bg-white text-black border rounded-lg px-4 py-3">Spent By: {username}</p>
            <p> expense created at {expense.createdAt.toDateString()}</p>
          </div>
        ))}
      </div>

      <div
      className="bg-green-500 px-5 py-4 rounded-lg shadow-xl text-2xl flex items-center justify-center gap-3 cursor-pointer mt-5"
        onClick={() => {
          addExpense();
        }}
      >
        <i className="bx bx-plus-circle text-3xl text-white"></i>
        <p>Add more expenses</p>
      </div>
    </div>
  );
};

export default Expense;
