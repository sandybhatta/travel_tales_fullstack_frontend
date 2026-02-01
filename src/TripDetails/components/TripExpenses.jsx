import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  useAddTripExpenseMutation,
  useDeleteTripExpenseMutation,
} from "../../slices/tripApiSlice";

const TripExpenses = ({ trip, formatAcceptedDate, onTripUpdate, isModal = false, organizedExpenses: propOrganizedExpenses }) => {
  const { _id: currentUserId } = useSelector((state) => state.user);
  
  // RTK Query
  const [addTripExpense, { isLoading: isSubmitting }] = useAddTripExpenseMutation();
  const [deleteTripExpense] = useDeleteTripExpenseMutation();
  
  const [error, setError] = useState("");
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    spentBy: ""
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const expenses = trip?.expenses || [];

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddExpense = async () => {
    // Only allow submission if all fields are filled
    if (!formData.title || !formData.amount || !formData.spentBy) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    
    try {
      await addTripExpense({
        tripId: trip._id,
        title: formData.title,
        amount: Number(formData.amount),
        spentBy: formData.spentBy
      }).unwrap();
      
      // Success: Refresh and reset
      setShowAddForm(false);
      setFormData({ title: "", amount: "", spentBy: "" });
      
    } catch (err) {
      setError(err?.data?.message || "Failed to add expense");
    }
  };

  // Group expenses by user (Client-side grouping)
  const organizedExpenses = useMemo(() => {
    if (propOrganizedExpenses) return propOrganizedExpenses;
    
    if (!expenses.length) return {};
    
    const grouped = {};
    expenses.forEach(expense => {
      const userId = expense.spentBy?._id || expense.spentBy; // Handle populated or id
      // Note: spentBy is populated in getExpensesTrip
      
      if (!grouped[userId]) {
        grouped[userId] = {
          user: expense.spentBy,
          totalAmount: 0,
          expenses: []
        };
      }
      grouped[userId].totalAmount += expense.amount;
      grouped[userId].expenses.push(expense);
    });
    return grouped;
  }, [expenses, propOrganizedExpenses]);

  // List of potential spenders (Owner + Collaborators)
  const potentialSpenders = useMemo(() => {
    const list = [trip.user]; // Owner
    if (trip.acceptedFriends) {
      trip.acceptedFriends.forEach(friend => list.push(friend.user));
    }
    return list;
  }, [trip]);

  // Get selected user object for dropdown display
  const selectedSpender = potentialSpenders.find(u => u._id === formData.spentBy);

  // Helper to determine if current user is the owner
  const isTripOwner = (trip.currentUser?.userStatus === 'owner') || 
                      (currentUserId && String(trip.user?._id || trip.user) === String(currentUserId));

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteTripExpense({ tripId: trip._id, expenseId }).unwrap();
    } catch (err) {
      setError(err?.data?.message || "Failed to delete expense");
    }
  };

  if (!trip.currentUser.canAccessPrivateData) return null;

  return (
    <div className={`flex flex-col items-center justify-start h-fit gap-5 w-full bg-white pb-6 px-3 md:px-5 transition-all ${isModal ? "" : "rounded-xl shadow-sm hover:shadow-md border border-gray-100"}`}>
      
      {/* Header */}
      <div className={`flex items-center ${isModal ? "justify-end" : "justify-between"} w-full py-2 border-b border-gray-100 mb-2`}>
        {!isModal && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <i className="bx bx-dollar-circle text-xl md:text-2xl text-red-500"></i>
            </div>
            <p className="text-base md:text-xl font-bold text-gray-800">Expenses</p>
          </div>
        )}
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${showAddForm ? 'bg-gray-100 text-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          <i className={`bx ${showAddForm ? 'bx-x' : 'bx-plus'} text-xl`}></i>
          <span className="font-semibold text-xs md:text-sm">{showAddForm ? 'Close' : 'Add'}</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-4 animate-fadeIn border border-gray-200">
          <h3 className="font-bold text-gray-700">Add New Expense</h3>
          
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Expense Title (e.g., Dinner, Taxi)"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            
            <div className="flex gap-3">
              <div className="w-1/3">
                <input 
                  type="number" 
                  placeholder="Amount"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              
              {/* Custom Dropdown for Spent By */}
              <div className="w-2/3 relative" ref={dropdownRef}>
                <div 
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-red-400"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {selectedSpender ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedSpender.avatar?.url || selectedSpender.avatar} className="w-6 h-6 rounded-full object-cover"/>
                      <span className="text-sm font-medium truncate">{selectedSpender.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Spent By...</span>
                  )}
                  <i className='bx bx-chevron-down text-gray-500'></i>
                </div>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {potentialSpenders.map(user => (
                      <div 
                        key={user._id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                        onClick={() => {
                          setFormData({...formData, spentBy: user._id});
                          setDropdownOpen(false);
                        }}
                      >
                        <img src={user.avatar?.url || user.avatar} className="w-8 h-8 rounded-full object-cover"/>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">
                            {user.name} 
                            {user._id === trip.currentUser._id && " (Me)"}
                          </span>
                          <span className="text-xs text-gray-500">@{user.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

          {/* Add Expense Button - Only call API if all fields are valid */}
          <button 
            disabled={isSubmitting || !formData.title || !formData.amount || !formData.spentBy}
            onClick={handleAddExpense}
            className="w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i> Saving...
              </>
            ) : (
              <>
                <i className='bx bx-check'></i> Save Expense
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading Shimmer (Only if expenses is null/undefined) */}
      {!trip.expenses ? (
        <div className="w-full flex flex-col gap-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="w-full bg-gray-100 h-32 rounded-lg"></div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <i className='bx bx-receipt text-4xl'></i>
          <p>No expenses added yet.</p>
        </div>
      ) : (
        /* Expenses List */
        <div className="flex flex-col items-center justify-around gap-6 w-full">
          {Object.keys(organizedExpenses).map((userId) => (
            <div
              key={userId}
              className="flex items-start justify-between gap-1 shadow-sm border border-gray-100 w-full bg-gray-50 p-4 rounded-xl"
            >
              <div className="flex flex-col items-start justify-around w-full gap-4">
                {/* User Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 w-full pb-2">
                  <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm">
                    <img
                      src={organizedExpenses[userId].user.avatar?.url || organizedExpenses[userId].user.avatar}
                      className="h-full w-full object-cover rounded-full"
                      alt="avatar"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-800 font-bold text-xs md:text-sm">
                      {organizedExpenses[userId].user.name}
                    </p>
                    <p className="text-gray-500 text-[10px] md:text-xs">
                      @{organizedExpenses[userId].user.username}
                    </p>
                  </div>
                  <div className="ml-auto bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-600">
                      Total: <span className="text-red-500 text-xs md:text-sm">${organizedExpenses[userId].totalAmount}</span>
                    </p>
                  </div>
                </div>

                {/* List of expenses for this user */}
                <div className="w-full flex flex-col gap-2">
                  {organizedExpenses[userId].expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="w-full flex items-center justify-between bg-white px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-semibold text-gray-800">
                          {expense.title}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400">
                          {formatAcceptedDate(expense.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <p className="text-xs md:text-sm text-red-500 font-bold">
                          ${expense.amount}
                        </p>
                        {/* Delete Button Logic */}
                        {(
                          isTripOwner || 
                          String(expense.spentBy?._id || expense.spentBy) === String(currentUserId)
                        ) && (
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Delete Expense"
                          >
                            <i className='bx bx-trash text-lg'></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripExpenses;
