import React from 'react';

const TripExpenses = ({ trip, organizedExpenses, formatAcceptedDate }) => {
  if (!trip.currentUser.canAccessPrivateData || !trip.expenses || trip.expenses.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-start h-fit gap-5 w-full bg-white rounded-lg  shadow-2xl pb-5 px-3">
      <div className="flex items-center justify-start gap-2 w-full px-3 py-2 mb-3">
        <i className="bx bx-dollar-circle text-2xl text-red-500"></i>
        <p className="text-xl text-black">Expenses</p>
      </div>

      <div className="flex flex-col items-center justify-around gap-4 ">
        {Object.keys(organizedExpenses).map((expenseUser) => (
          <div
            key={organizedExpenses[expenseUser].user._id}
            className="flex  items-center justify-between gap-1 shadow-md w-full bg-[#EDF2F4] p-2 "
          >
            <div className="flex flex-col items-start justify-around">
              <div className="flex items-center justify-around gap-2">
                <div className="h-12 w-12 rounded-full border-2 border-white">
                  <img
                    src={
                      organizedExpenses[expenseUser].user.avatar
                        ?.url ||
                      organizedExpenses[expenseUser].user.avatar
                    }
                    className="h-full object-cover"
                  />
                </div>

                {/* name and username */}
                <div className="flex flex-col items-start justify-around gap-1">
                  <p className="text-black text-lg ">
                    {organizedExpenses[expenseUser].user.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    @
                    {organizedExpenses[expenseUser].user.username}{" "}
                  </p>
                </div>
              </div>
              {/* all the expenses of the user */}
              <div className="w-full p-2 flex flex-col items-center justify-center gap-3">
                {organizedExpenses[expenseUser].expenses.map(
                  (expense) => (
                    <div
                      key={expense._id}
                      className="w-full flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-md"
                    >
                      <div className="flex flex-col flex-wrap items-start jusitfy-center gap-2">
                        <p className="text-base text-black">
                          {expense.title}
                        </p>

                        <p className="text-sm text-gray-500 font-semibold">
                          {formatAcceptedDate(expense.createdAt)}{" "}
                        </p>
                      </div>
                      <p className="text-base text-red-500 font-semibold">
                        ${expense.amount}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="w-full h-[1.5px] bg-gray-500 rounded-full"></div>

              <p className="text-sm font-bold text-black">
                {`Total: $${organizedExpenses[expenseUser].totalAmount}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripExpenses;
