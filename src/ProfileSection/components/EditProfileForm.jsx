import React, { useState, useEffect } from "react";
import mainApi from "../../Apis/axios";
import AvatarUploader from "./AvatarUploader";

const INTEREST_OPTIONS = [
  "adventure", "beach", "mountains", "history", "food", "wildlife", "culture",
  "luxury", "budget", "road_trip", "solo", "group", "trekking", "spiritual",
  "nature", "photography", "festivals", "architecture", "offbeat", "shopping",
];

/**
 * Form for editing user profile details.
 * Handles API calls and upload progress.
 *
 * @param {Object} props
 * @param {Object} props.user - Current user data.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onUpdate - Callback when profile is updated successfully.
 */
const EditProfileForm = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    city: "",
    state: "",
    country: "",
    interests: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        city: user.location?.city || "",
        state: user.location?.state || "",
        country: user.location?.country || "",
        interests: Array.isArray(user.interests) ? user.interests : [],
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const nextInterests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: nextInterests };
    });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    setUploadProgress(0);

    try {
      const payload = { ...formData };
      let res;

      if (avatarFile) {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            data.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null && value !== "") {
            data.append(key, value);
          }
        });
        data.append("avatar", avatarFile);

        res = await mainApi.patch("/api/user/update-profile", data, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });
      } else {
        res = await mainApi.patch("/api/user/update-profile", payload);
      }

      const updatedUser = res.data?.user;
      if (updatedUser) {
        onUpdate(updatedUser);
      }
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto p-5">
        <h2 className="text-lg font-semibold mb-4">Edit profile</h2>
        <div className="space-y-3">
          <AvatarUploader
            currentAvatarUrl={user?.avatar?.url || user?.avatar}
            onFileSelect={setAvatarFile}
          />
          
          <div>
            <p className="block text-xs font-semibold text-gray-600 mb-1">Name</p>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <p className="block text-xs font-semibold text-gray-600 mb-1">Bio</p>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["city", "state", "country"].map((field) => (
              <div key={field}>
                <p className="block text-xs font-semibold text-gray-600 mb-1 capitalize">
                  {field}
                </p>
                <input
                  type="text"
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </div>

          <div>
            <p className="block text-xs font-semibold text-gray-600 mb-2">Interests</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-32 overflow-y-auto border p-2 rounded-lg">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      selected
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {interest.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && avatarFile && (
           <div className="mt-4">
             <div className="w-full bg-gray-200 rounded-full h-2.5">
               <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
             </div>
             <p className="text-xs text-center text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
           </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
