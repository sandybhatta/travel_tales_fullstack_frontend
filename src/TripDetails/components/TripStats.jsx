import React from 'react';

const TripStats = ({ trip, stats, showTripStats, setShowTripStats }) => {
  return (
    <div className="w-full bg-white shadow-2xl rounded-lg px-3 py-2 flex flex-col items-center  gap-5">
      <div className="w-full px-3  flex items-center justify-start gap-2">
        <i className="bx  bx-chart-bar-columns text-red-500 text-2xl"></i>
        <h2 className="text-xl text-black"> Trip Stats </h2>
      </div>

      <div className="w-full flex flex-col items-center justify-start gap-3 px-3 py-2 relative">
        {/* common stats */}
        
        {/* duration */}
        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500">
            Trip Duration :
          </p>
          <p className="text-base text-black font-bold">
            {stats.duration} days{" "}
          </p>
        </div>


        {/* trip status */}
        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500 ">
            Trip Status :
          </p>
          <p className="text-base text-black font-bold ">
            {stats.tripStatus}{" "}
          </p>
        </div>

        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500">
            Posts :
          </p>
          <p className="text-base text-black font-bold">
            {stats.totalPosts}
          </p>
        </div>

        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500">
            Highlighted Posts :
          </p>
          <p className="text-base text-black font-bold">
            {stats.highlightedPostCount}
          </p>
        </div>
        
        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500">
            Total Destinations :
          </p>
          <p className="text-base text-black font-bold">
            {trip.destinations.length}
          </p>
        </div>

        <div className=" flex items-center justify-between  w-full p-2">
          <p className="text-base text-gray-500">
            Trip Type :
          </p>
          <p className="text-base text-black font-bold">
            {stats.isCollaborative ? "Collaborative" : "Single"}
          </p>
        </div>

        { trip.currentUser.canAccessPrivateData && 
        <div className=" flex items-center justify-start gap-2 cursor-pointer w-full bg-red-500/50 px-2 py-2 rounded-lg hover:bg-red-500/70"
        onClick={(e)=>{
          e.stopPropagation();
          setShowTripStats(prev=>!prev)
        }}
        >
          <p className="text-white text-lg leckerli">Advance stats</p>
          <i className= {`bx bx-chevron-${showTripStats ?"up":"down"} text-white text-xl`}></i>
         </div>
         }

        {/* private data only for owners and collaborators */}
        {trip.currentUser.canAccessPrivateData && showTripStats && (
          <>
            <div className=" flex items-center justify-between  w-full p-2">
              <p className="text-base text-gray-500">
                Total Travel Budget :
              </p>
              <p className="text-base text-black font-bold">
                {stats.travelBudget}
              </p>
            </div>
            <div className=" flex items-center justify-between  w-full p-2">
              <p className="text-base text-gray-500">
                Total Travel Expense :
              </p>
              <p className="text-base text-black font-bold">
                {stats.totalExpense}
              </p>
            </div>
            <div className=" flex items-center justify-between  w-full p-2">
              <p className="text-base text-gray-500">
                Total Pinned Notes:
              </p>
              <p className="text-base text-black font-bold">
                {stats.totalPinnedNotes}
              </p>
            </div>
            <div className=" flex items-center justify-between  w-full p-2">
              <p className="text-base text-gray-500">
                Todos Completed:
              </p>
              <p className="text-base text-black font-bold">
                {stats.completedTasks} / {stats.totalTasks}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripStats;
