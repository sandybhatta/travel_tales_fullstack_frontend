import React from 'react';

const TripCollaborators = ({
  trip,
  showCollaboratorModal,
  setShowCollaboratorModal,
  activeCollaboratorPage,
  setActiveCollaboratorPage,
  invitedUsers,
  setConfirmCollaboratorRemoval,
  setConfirmInvitedRemoval,
  formatAcceptedDate
}) => {
  return (
    <div className="w-full px-5 py-6 bg-white rounded-lg flex items-start justify-start gap-5">
      {/* owner */}
      <div className="h-15 w-[35%] flex items-center justify-center gap-2">
        <h2>Trip Owner :</h2>
        <img
          src={trip.user.avatar?.url || trip.user.avatar}
          alt="Owner Avatar"
          className="h-full  rounded-full object-cover"
        />
        <div className="flex flex-col items-start justify-center gap-1">
          <p className="text-base "> {trip.user.name}</p>
          <p className="text-sm text-gray-500 ">
            @{trip.user.username}
          </p>
        </div>
      </div>

      <div className="bg-gray-500 shadow-2xl h-15 w-[2px] rounded-lg"></div>

      {/* collaborators */}
      <div className="w-[60%] flex items-center justify-start gap-5 relative">
        {!showCollaboratorModal && <h2>Collaborators:</h2>}

        {/* see more */}
        {trip.acceptedFriends &&
          trip.acceptedFriends.length > 0 &&
          !showCollaboratorModal && (
            <div
              className="absolute top-1/2 -translate-y-1/2 right-2 flex  items-center justify-center gap-1 cursor-pointer px-3 py-1 bg-red-500 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowCollaboratorModal((prev) => !prev);
              }}
            >
              <p className="text-base text-white"> See More </p>
              <i
                className={` bx bx-caret-${
                  showCollaboratorModal ? "up" : "down"
                } text-2xl text-white`}
              ></i>
            </div>
          )}

        {/* collaborators in short form */}
        {!showCollaboratorModal && (
          <div className="w-1/2 flex -space-x-3">
            {trip.acceptedFriends && trip.acceptedFriends.length > 0 ? (
              trip.acceptedFriends.slice(0, 5).map((friend) => (
                <span
                  key={friend.id}
                  className="h-16 w-16  rounded-full border-2 border-white group relative"
                >
                  <img
                    src={friend.user.avatar?.url || friend.user.avatar}
                    className="h-full object-cover rounded-full "
                  />

                  <span className="absolute bottom-0 translate-y-[100%] left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {friend.user.name}
                  </span>
                </span>
              ))
            ) : trip.invitedFriends &&
              trip.invitedFriends.length > 0 ? (
              <p className="text-gray-500">
                No collaborators joined yet.
              </p>
            ) : (
              <p className="text-gray-500">
                This is a Solo Trip. No friends have been invited.
              </p>
            )}
          </div>
        )}

        {showCollaboratorModal && (
          <div className="w-full flex flex-col items-start justify-start gap-2 shadow-2xl p-5 rounded-xl relative">
            <i
              className="text-3xl bx bx-x text-red-500 font-bold p-2   absolute right-3 top-3 cursor-pointer"
              onClick={() => {
                setShowCollaboratorModal(false);
              }}
            ></i>
            {/* page to see colloborators or inviteds */}
            <div className="flex items-center justify-start w-full gap-3">
              <div
                className={`px-3 cursor-pointer py-1 hover:shadow-2xl rounded-lg font-semibold ${
                  activeCollaboratorPage === "collaborators"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCollaboratorPage("collaborators");
                }}
              >
                Collaborators ({trip?.acceptedFriends?.length || 0})
              </div>
              {trip.currentUser.canAccessPrivateData && (
                <div
                  className={`px-3 cursor-pointer py-1 hover:shadow-2xl rounded-lg font-semibold ${
                    activeCollaboratorPage === "inviteds"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCollaboratorPage("inviteds");
                  }}
                >
                  Invited Friends ({trip?.invitedFriends?.length || 0})
                </div>
              )}
            </div>

            {/* list of collborator */}

            {activeCollaboratorPage === "collaborators" ? (
              <div className="flex flex-col items-center justify-around gap-5">
                {trip.acceptedFriends.map((friend) => (
                  <div
                    className="px-4 py-2 border rounded-lg shadow-lg"
                    key={friend._id}
                  >
                    <div className="flex flex-wrap items-center justify-start gap-3 ">
                      <img
                        src={
                          friend.user.avatar?.url || friend.user.avatar
                        }
                        className="h-16 w-16 object-cover rounded-full "
                      />
                      <div className="flex flex-col items-start justify-center gap-1">
                        <p className="text-base ">
                          {" "}
                          {friend.user.name}
                        </p>
                        <p className="text-sm text-gray-500 ">
                          @{friend.user.username}
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">
                          Accepted At :{" "}
                          {formatAcceptedDate(friend.acceptedAt)}
                        </p>
                      </div>

                      {trip.currentUser.userStatus === "owner" && (
                        <div
                          className="flex items-center justify-around gap-2 rounded-lg shadow-2xl bg-red-500 px-3 py-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmCollaboratorRemoval({
                              confirm: true,
                              userId: friend.user._id,
                            });
                          }}
                        >
                          <i className="bx bx-user-minus text-2xl text-white"></i>
                          <p className="text-base font-semibold text-white">
                            Remove
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-around gap-5">
                {trip.invitedFriends &&
                  trip.invitedFriends.length === 0 && (
                    <p className="text-4xl font-semibold w-full text-black">
                      No Invited Friends{" "}
                    </p>
                  )}
                {trip.invitedFriends &&
                  trip.invitedFriends.length > 0 && (
                    <div className="flex flex-col items-center justify-around gap-5">
                      {invitedUsers.map((friend) => (
                        <div
                          className="px-4 py-2 border rounded-lg shadow-lg"
                          key={friend._id}
                        >
                          <div className="flex flex-wrap items-center justify-start gap-3 ">
                            <img
                              src={friend.avatar?.url || friend.avatar}
                              className="h-16 w-16 object-cover rounded-full "
                            />
                            <div className="flex flex-col items-start justify-center gap-1">
                              <p className="text-base ">
                                {" "}
                                {friend.name}
                              </p>
                              <p className="text-sm text-gray-500 ">
                                @{friend.username}
                              </p>
                            </div>

                            {trip.currentUser.userStatus ===
                              "owner" && (
                              <div
                                className="flex items-center justify-around gap-2 rounded-lg shadow-2xl bg-red-500 px-3 py-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmInvitedRemoval({
                                    confirm: true,
                                    userId: friend._id,
                                  });
                                }}
                              >
                                <i className="bx bx-user-minus text-2xl text-white"></i>
                                <p className="text-base font-semibold text-white">
                                  Remove
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCollaborators;
