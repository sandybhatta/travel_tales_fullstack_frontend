import React from "react";
import { Link } from "react-router-dom";

/**
 * Modal to display lists of users (followers, following, etc.).
 */
const UserListModal = ({
  type,
  loading,
  error,
  users,
  onClose,
  ownProfile,
  actionLoadingId,
  onRemoveCloseFriend,
  onUnfollow,
  onAddCloseFriend,
  onFollow,
}) => {
  const getTitle = () => {
    switch (type) {
      case "mutual": return "Mutual followers";
      case "followers": return "Followers";
      case "following": return "Following";
      default: return "Close friends";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold capitalize">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <p className="text-gray-500 text-sm">Loading users...</p>
            </div>
          )}
          {!loading && error && (
            <div className="flex items-center justify-center py-6 px-4">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="flex items-center justify-center py-6">
              <p className="text-sm text-gray-500">No users found.</p>
            </div>
          )}
          {!loading && !error && users.length > 0 && (
            <div className="p-2">
              {users.map((u) => {
                const avatar = u.avatar?.url || u.avatar;
                const isBusy = actionLoadingId === u._id;
                const isCloseFriendsList = type === "closeFriends";

                return (
                  <div
                    key={u._id}
                    className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Link
                      to={`/profile/${u._id}`}
                      className="flex items-center gap-3 flex-1"
                      onClick={onClose}
                    >
                      <img
                        src={avatar || "/default-avatar.png"}
                        alt={u.username || u.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {u.name || u.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          @{u.username}
                        </span>
                      </div>
                    </Link>

                    {isCloseFriendsList && (
                      <button
                        type="button"
                        onClick={() => onRemoveCloseFriend(u._id)}
                        disabled={isBusy}
                        className="ml-2 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        <i className="bx bx-trash text-base mr-1" />
                        {isBusy ? "Removing..." : "Remove"}
                      </button>
                    )}

                    {type === "following" && ownProfile && (
                      <div className="flex items-center gap-2">
                        {u.isCloseFriend || u._localIsCloseFriend ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                            <i className="bx bx-star text-base mr-1" />
                            Close friend
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddCloseFriend(u._id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <i className="bx bx-star text-base mr-1" />
                            Add close
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onUnfollow(u._id)}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : "Unfollow"}
                        </button>
                      </div>
                    )}

                    {type === "followers" && ownProfile && (
                      <div className="flex items-center gap-2">
                        {u.followBack ? (
                          <button
                            type="button"
                            onClick={() => onUnfollow(u._id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
                          >
                            {isBusy ? "Updating..." : "Unfollow"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onFollow(u._id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center rounded-full bg-red-500 text-white px-3 py-1 text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
                          >
                            {isBusy ? "Updating..." : "Follow Back"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
