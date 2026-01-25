import React from 'react'

const AllInvitedTrips = ({ loading }) => {
  if (loading) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-xl overflow-hidden h-[450px] animate-pulse">
                      <div className="h-48 bg-gray-700"></div>
                      <div className="p-5 space-y-4">
                          <div className="h-14 bg-gray-700 rounded-lg"></div>
                          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                          <div className="h-10 bg-gray-700 rounded-lg mt-4"></div>
                      </div>
                  </div>
              ))}
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <i className='bx bx-list-ul text-6xl mb-4 text-gray-600'></i>
        <p className="text-xl">All Trips View (Coming Soon)</p>
    </div>
  )
}

export default AllInvitedTrips