import React from 'react';

const TripStats = ({ trip, stats, showTripStats, setShowTripStats }) => {
  return (
    <div className="w-full bg-white shadow-sm hover:shadow-md transition-all rounded-xl px-3 py-3 md:px-5 md:py-4 flex flex-col items-center gap-3 md:gap-5 border border-gray-100">
      <div className="w-full flex items-center justify-start gap-3">
        <div className="p-2 bg-red-50 rounded-lg flex items-center justify-center">
          <i className="bx bx-chart-line text-red-500 text-xl md:text-2xl"></i>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800"> Trip Stats </h2>
      </div>

      <div className="w-full flex flex-col items-center justify-start gap-2 md:gap-3 relative">
        {/* common stats */}
        
        {/* duration */}
        <div className=" flex items-center justify-between w-full p-2 border-b border-gray-50">
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Duration
          </p>
          <p className="text-sm md:text-base text-gray-800 font-bold">
            {stats.duration} days
          </p>
        </div>


        {/* trip status */}
        <div className=" flex items-center justify-between w-full p-2 border-b border-gray-50">
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Status
          </p>
          <p className="text-sm md:text-base text-gray-800 font-bold capitalize">
            {stats.tripStatus}
          </p>
        </div>

        <div className=" flex items-center justify-between w-full p-2 border-b border-gray-50">
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Posts
          </p>
          <p className="text-sm md:text-base text-gray-800 font-bold">
            {stats.totalPosts || trip.posts.length}
          </p>
        </div>
        
        <div className=" flex items-center justify-between w-full p-2 border-b border-gray-50">
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Destinations
          </p>
          <p className="text-sm md:text-base text-gray-800 font-bold">
            {trip.destinations.length}
          </p>
        </div>

        <div className=" flex items-center justify-between w-full p-2">
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Type
          </p>
          <p className="text-sm md:text-base text-gray-800 font-bold">
            {stats.isCollaborative ? "Collaborative" : "Solo"}
          </p>
        </div>

        { trip.currentUser.canAccessPrivateData && 
        <button className="w-full flex items-center justify-center gap-2 mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        onClick={(e)=>{
          e.stopPropagation();
          setShowTripStats(prev=>!prev)
        }}
        >
          <span className="font-semibold text-sm md:text-base">Advanced Stats</span>
          <i className= {`bx bx-chevron-${showTripStats ?"up":"down"} text-lg md:text-xl`}></i>
         </button>
         }

        {/* private data only for owners and collaborators */}
        {trip.currentUser.canAccessPrivateData && showTripStats && (
          <div className="w-full flex flex-col gap-1 bg-gray-50 rounded-lg p-2 mt-2 animate-fadeIn">
             <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
              <p className="text-sm md:text-base text-gray-500">
                Highlighted Posts
              </p>
              <p className="text-sm md:text-base text-gray-800 font-bold">
                {stats.highlightedPostCount}
              </p>
            </div>

            <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
              <p className="text-sm md:text-base text-gray-500">
                Travel Budget
              </p>
              <p className="text-sm md:text-base text-gray-800 font-bold">
                ${stats.travelBudget || 0}
              </p>
            </div>
            <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
              <p className="text-sm md:text-base text-gray-500">
                Total Expense
              </p>
              <p className="text-sm md:text-base text-gray-800 font-bold">
                ${stats.totalExpense}
              </p>
            </div>
            <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
               <p className="text-sm md:text-base text-gray-500">
                 Highest Spender
               </p>
               <p className="text-sm md:text-base text-gray-800 font-bold">
                 {(() => {
                    if (!trip.expenses || trip.expenses.length === 0) return "N/A";
                    
                    const spenderStats = trip.expenses.reduce((acc, expense) => {
                        const id = expense.spentBy?._id || expense.spentBy; 
                        // Handle potential missing object if not populated, though getTripById populates it
                        // But wait, spentBy is populated.
                        // Let's rely on what's available.
                        const name = expense.spentBy?.name || "Unknown";
                        if (!acc[id]) acc[id] = { name, amount: 0 };
                        acc[id].amount += expense.amount;
                        return acc;
                    }, {});
                    
                    const spenders = Object.values(spenderStats);
                    if (spenders.length === 0) return "N/A";
                    
                    const max = spenders.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
                    return `${max.name} ($${max.amount})`;
                 })()}
               </p>
             </div>
             <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
               <p className="text-sm md:text-base text-gray-500">
                 Lowest Spender
               </p>
               <p className="text-sm md:text-base text-gray-800 font-bold">
                 {(() => {
                    if (!trip.expenses || trip.expenses.length === 0) return "N/A";
                    
                    const spenderStats = trip.expenses.reduce((acc, expense) => {
                        const id = expense.spentBy?._id || expense.spentBy; 
                        const name = expense.spentBy?.name || "Unknown";
                        if (!acc[id]) acc[id] = { name, amount: 0 };
                        acc[id].amount += expense.amount;
                        return acc;
                    }, {});
                    
                    const spenders = Object.values(spenderStats);
                    if (spenders.length === 0) return "N/A";
                    
                    const min = spenders.reduce((prev, current) => (prev.amount < current.amount) ? prev : current);
                    return `${min.name} ($${min.amount})`;
                 })()}
               </p>
             </div>
             <div className=" flex items-center justify-between w-full p-2 border-b border-gray-200">
               <p className="text-sm md:text-base text-gray-500">
                 Pinned Notes
               </p>
               <p className="text-sm md:text-base text-gray-800 font-bold">
                 {stats.totalPinnedNotes} / {trip.notes?.length || 0}
               </p>
             </div>
             <div className=" flex items-center justify-between w-full p-2">
               <p className="text-sm md:text-base text-gray-500">
                 Todos Completed
               </p>
               <p className="text-sm md:text-base text-gray-800 font-bold">
                 {stats.completedTasks} / {stats.totalTasks}
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripStats;
