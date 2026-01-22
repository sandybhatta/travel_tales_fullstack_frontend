import React from 'react';

const TripRemovalModals = ({
  confirmCollaboratorRemoval,
  setConfirmCollaboratorRemoval,
  handleRemoveCollaborator,
  confirmInvitedRemoval,
  setConfirmInvitedRemoval,
  handleRemoveInviteds
}) => {
  return (
    <>
      {/* confirmation before removing the collaborators */}
      {confirmCollaboratorRemoval.confirm && (
        <div className="w-screen h-screen fixed top-0 left-0 bg-black/40 flex items-center justify-center z-40">
          <div className="w-[40%] h-[30%] bg-white rounded-xl flex flex-col items-center justify-center gap-5 p-5 relative">
            <i
              className="text-3xl bx bx-x text-red-500 font-bold p-2 absolute right-3 top-3 shadow-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmCollaboratorRemoval({
                  confirm: false,
                  userId: null,
                });
              }}
            ></i>

            <p className="text-2xl font-semibold text-black">
              Are you Sure to remove this Collaborator
            </p>
            <div className="w-full flex items-center justify-center gap-8 ">
              <p
                className="bg-red-500 text-white text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCollaborator(confirmCollaboratorRemoval.userId);
                  setConfirmCollaboratorRemoval({
                    confirm: false,
                    userId: null,
                  });
                }}
              >
                Yes
              </p>
              <p
                className="bg-gray-400 text-black text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmCollaboratorRemoval({
                    confirm: false,
                    userId: null,
                  });
                }}
              >
                No
              </p>
            </div>
          </div>
        </div>
      )}

      {/* confirmation before removing the inviteds */}
      {confirmInvitedRemoval.confirm && (
        <div className="w-screen h-screen fixed top-0 left-0 bg-black/40 flex items-center justify-center z-40">
          <div className="w-[40%] h-[30%] bg-white rounded-xl flex flex-col items-center justify-center gap-5 p-5 relative">
            <i
              className="text-3xl bx bx-x text-red-500 font-bold p-2 absolute right-3 top-3 shadow-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmInvitedRemoval({
                  confirm: false,
                  userId: null,
                });
              }}
            ></i>

            <p className="text-2xl font-semibold text-black">
              Are you Sure to remove this Invited User
            </p>
            <div className="w-full flex items-center justify-center gap-8 ">
              <p
                className="bg-red-500 text-white text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveInviteds(confirmInvitedRemoval.userId);
                  setConfirmInvitedRemoval({
                    confirm: false,
                    userId: null,
                  });
                }}
              >
                Yes
              </p>
              <p
                className="bg-gray-400 text-black text-xl px-3 py-1 rounded-lg font-semibold cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmInvitedRemoval({
                    confirm: false,
                    userId: null,
                  });
                }}
              >
                No
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripRemovalModals;
