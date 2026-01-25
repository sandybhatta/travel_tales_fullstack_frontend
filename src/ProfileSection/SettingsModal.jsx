import React, { useState, useEffect } from "react";
import mainApi from "../Apis/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slices/userSlice";
const SettingsModal = ({ isOpen, onClose, userData, setUserData }) => {
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <AccountSettings
            userData={userData}
            setUserData={setUserData}
            setLoading={setLoading}
            setError={setError}
            setSuccessMsg={setSuccessMsg}
            navigate={navigate}
            dispatch={dispatch}
          />
        );
      case "privacy":
        return (
          <PrivacySettings
            userData={userData}
            setUserData={setUserData}
            setLoading={setLoading}
            setError={setError}
            setSuccessMsg={setSuccessMsg}
          />
        );
      case "blocked":
        return (
          <BlockedUsers
            setLoading={setLoading}
            setError={setError}
            setSuccessMsg={setSuccessMsg}
          />
        );
      case "activity":
        return <ActivitySettings />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all">
        
        {/* Navigation Sidebar / Topbar */}
        <div className="w-full md:w-1/4 bg-gray-50/80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Settings</h2>
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-gray-200 transition"
            >
              <i className="bx bx-x text-2xl text-gray-600"></i>
            </button>
          </div>
          
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-4 md:px-0 pb-2 md:pb-4 gap-2 md:gap-1 no-scrollbar">
            <SidebarItem
              icon="bx-user"
              label="Account"
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
            />
            <SidebarItem
              icon="bx-lock-keyhole"
              label="Privacy"
              active={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
            />
            <SidebarItem
              icon="bx-block"
              label="Blocked"
              active={activeTab === "blocked"}
              onClick={() => setActiveTab("blocked")}
            />
            <SidebarItem
              icon="bx-history"
              label="Activity"
              active={activeTab === "activity"}
              onClick={() => setActiveTab("activity")}
            />
            
            <div className="hidden md:block flex-1"></div>
            
            <button
              onClick={handleLogout}
              className="hidden md:flex w-full items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all border-t border-gray-100 mt-auto"
            >
              <i className="bx bx-arrow-out-left-square-half text-xl"></i>
              
              Log Out
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          {/* Desktop Close Button */}
          <button 
            onClick={onClose} 
            className="hidden md:block absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all shadow-sm border border-gray-100"
            title="Close Settings"
          >
            <i className='bx bx-x text-2xl'></i>
          </button>

          <div className="flex-1 overflow-y-auto p-5 md:p-10 pb-20 md:pb-10">
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn">
                <i className="bx bx-error-circle text-lg"></i>
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn">
                <i className="bx bx-check-circle text-lg"></i>
                {successMsg}
              </div>
            )}
            
            <div className="animate-slideIn">
              {renderContent()}
            </div>
          </div>

          {/* Mobile Logout Button (Fixed at bottom) */}
          <div className="md:hidden p-4 border-t border-gray-100 bg-white safe-area-bottom">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold active:scale-95 transition-transform"
            >
              <i className="bx bx-log-out text-xl"></i>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 md:w-full flex md:items-center gap-2 md:gap-4 px-4 md:px-8 py-2 md:py-4 text-sm font-medium transition-all rounded-full md:rounded-none whitespace-nowrap ${
      active
        ? "bg-gray-900 md:bg-white text-white md:text-red-600 md:border-r-4 md:border-red-600 shadow-md md:shadow-none"
        : "bg-white text-gray-600 md:hover:bg-gray-50 border border-gray-200 md:border-none"
    }`}
  >
    <i className={`bx ${icon} text-lg md:text-xl`}></i>
    {label}
  </button>
);

/* --- Sub-Components --- */

const AccountSettings = ({
  userData,
  setUserData,
  setLoading,
  setError,
  setSuccessMsg,
  navigate,
  dispatch,
}) => {
  const [username, setUsername] = useState(userData?.user?.username || "");
  const [name, setName] = useState(userData?.user?.name || "");
  const [email, setEmail] = useState(userData?.user?.email || "");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deactivatePassword, setDeactivatePassword] = useState("");

  const { canChange, daysRemaining } = userData?.usernameChangeStatus || { canChange: true, daysRemaining: 0 };

  const handleUpdatePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError("All password fields are required");
    }
    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await mainApi.post("/api/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccessMsg(res.data.message || "Password changed successfully");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return setError("Name cannot be empty");
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await mainApi.patch("/api/user/update-profile", {
        name,
      });
      setUserData((prev) => ({
        ...prev,
        user: { ...prev.user, name: res.data.user.name || name },
      }));
      setSuccessMsg("Name updated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!canChange) return setError(`You can change your username in ${daysRemaining} days.`);
    if (!username.trim()) return setError("Username cannot be empty");
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await mainApi.patch("/api/user/change-username", {
        username,
      });
      setUserData((prev) => ({
        ...prev,
        user: { ...prev.user, username: res.data.newUsername || username },
        usernameChangeStatus: res.data.usernameChangeStatus || prev.usernameChangeStatus
      }));
      setSuccessMsg("Username updated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) return setError("Email cannot be empty");
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await mainApi.patch("/api/user/change-email", { email });
      setSuccessMsg(
        res.data?.message || "Verification link sent to your new email."
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await mainApi.post("/api/auth/deactivate-user", {
        deactivationReason: "User preference",
      });
      dispatch(logout());
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate account");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deactivatePassword) return setError("Password required to delete account");
    setLoading(true);
    try {
      await mainApi.delete("/api/user/delete", {
        data: { password: deactivatePassword },
      });
      dispatch(logout());
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-slideIn">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter name"
              />
              <button
                onClick={handleUpdateName}
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all shadow-sm"
              >
                Update
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!canChange}
                className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${!canChange ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="Enter username"
              />
              <button
                onClick={handleUpdateUsername}
                disabled={!canChange}
                className={`w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ${!canChange ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black active:scale-95"}`}
              >
                Update
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              {canChange ? (
                <p className="text-green-600 flex items-center gap-1 font-medium">
                  <i className="bx bx-check-circle text-lg"></i>
                  Username change available.
                </p>
              ) : (
                <p className="text-orange-600 flex items-center gap-1 font-medium">
                  <i className="bx bx-time-five text-lg"></i>
                  Next change available in {daysRemaining} days.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter email address"
              />
              <button
                onClick={handleUpdateEmail}
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all shadow-sm"
              >
                Update
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Change Password
            </label>
            <div className="space-y-3">
              <input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Current Password"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="New Password"
                />
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm New Password"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleUpdatePassword}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all shadow-sm"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h3>
        
        <div className="mb-6 max-w-md">
           <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password for Account Deletion
            </label>
            <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password to confirm deletion"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <i className="bx bx-user-x text-xl"></i>
              </div>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Deactivate Account</h4>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Temporarily hide your profile and content. You can reactivate anytime.
            </p>
            <button
              onClick={handleDeactivate}
              className="w-full py-2.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              Deactivate
            </button>
          </div>

          <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <i className="bx bx-trash text-xl"></i>
              </div>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Delete Account</h4>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Permanently remove your account and data. This cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="w-full py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacySettings = ({
  userData,
  setUserData,
  setLoading,
  setError,
  setSuccessMsg,
}) => {
  const [visibility, setVisibility] = useState(
    userData?.privacy?.profileVisibility || "public"
  );
  const [comments, setComments] = useState(
    userData?.privacy?.allowComments || "everyone"
  );

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await mainApi.put("/api/user/settings/privacy", {
        profileVisibility: visibility,
        allowComments: comments,
      });
      setUserData((prev) => ({
        ...prev,
        privacy: res.data.privacy,
      }));
      setSuccessMsg("Privacy settings updated");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update privacy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slideIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h3>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Profile Visibility
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["public", "followers", "private"].map((opt) => (
              <button
                key={opt}
                onClick={() => setVisibility(opt)}
                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  visibility === opt
                    ? "bg-red-50 text-red-700 ring-2 ring-red-500 ring-offset-1"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="capitalize">{opt}</div>
                {visibility === opt && (
                  <div className="absolute top-2 right-2 text-red-500">
                    <i className="bx bx-check-circle"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Control who can see your profile and posts.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Who can comment on your posts?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["everyone", "followers", "close_friends", "no_one"].map((opt) => (
              <button
                key={opt}
                onClick={() => setComments(opt)}
                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  comments === opt
                    ? "bg-red-50 text-red-700 ring-2 ring-red-500 ring-offset-1"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="capitalize">{opt.replace("_", " ")}</div>
                {comments === opt && (
                  <div className="absolute top-2 right-2 text-red-500">
                    <i className="bx bx-check-circle"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black active:scale-95 transition-all shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const BlockedUsers = ({ setLoading, setError }) => {
  const [users, setUsers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchBlocked();
  }, []);

  const fetchBlocked = async () => {
    try {
      const res = await mainApi.get("/api/user/settings/blocked");
      setUsers(res.data.blockedUsers || []);
    } catch (err) {
      setError("Failed to fetch blocked users");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    setLoading(true);
    try {
      await mainApi.delete(`/api/user/settings/unblock/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError("Failed to unblock user");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-3"></div>
      <p className="text-sm">Loading blocked users...</p>
    </div>
  );

  return (
    <div className="animate-slideIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Blocked Users</h3>
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
            <i className="bx bx-user-check text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-500 font-medium">You haven't blocked anyone.</p>
          <p className="text-xs text-gray-400 mt-1">Blocked users will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar?.url || u.avatar || "/default-avatar.png"}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{u.username}</p>
                  <p className="text-xs text-gray-500">Blocked</p>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(u._id)}
                className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActivitySettings = () => {
  const [subTab, setSubTab] = useState("likes");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [subTab]);

  const fetchActivity = async () => {
    setLoading(true);
    setItems([]);
    try {
      let endpoint = "/api/user/activity/likes/posts";
      if (subTab === "comments") endpoint = "/api/user/activity/comments/posts";
      if (subTab === "trips") endpoint = "/api/user/activity/likes/trips";

      const res = await mainApi.get(endpoint);
      setItems(res.data?.posts || res.data?.trips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slideIn h-full flex flex-col">
      <div className="flex gap-2 md:gap-4 border-b border-gray-100 mb-6 overflow-x-auto pb-1 no-scrollbar flex-shrink-0">
        {[
          { id: "likes", label: "Liked Posts", icon: "bx-heart" },
          { id: "comments", label: "Commented Posts", icon: "bx-message-circle-reply" },
          { id: "trips", label: "Liked Trips", icon: "bx-plane-alt" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`pb-3 px-2 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              subTab === tab.id
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
            }`}
          >
            <i className={`bx ${tab.icon} text-lg`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-400">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <i className="bx bx-ghost text-3xl"></i>
          </div>
          <p className="text-sm font-medium">No activity found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2 overflow-y-auto pb-20 md:pb-0 pr-1">
          {items.map((item) => {
            // Determine image source based on item type
            let img = null;
            let title = "";

            if (subTab === "trips") {
              img = item.coverPhoto?.url || item.coverPhoto;
              title = item.title;
            } else {
              // Posts
              img = item.media?.[0]?.url || item.media?.[0];
              title = item.caption;
            }

            return (
              <div
                key={item._id}
                className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer rounded-lg md:rounded-xl"
              >
                {img ? (
                  <>
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 p-2">
                     <p className="text-[10px] text-white line-clamp-3 text-center opacity-80">{title || "No content"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
