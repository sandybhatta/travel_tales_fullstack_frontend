import React, { useState } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_LIVE_URL}/api/auth`;

const ReactivationModal = ({ userId, message, onClose }) => {
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReactivate = async () => {
    try {
      const res = await axios.post(`${API_BASE}/reactivate-user`, { userId });
      setStatus(res.data.message);
      setSuccess(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Reactivation failed");
      setSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm text-center animate-fadeIn">
        <h3 className="font-bold text-lg mb-2 text-gray-800">
          {success ? "Welcome Back!" : "Account Deactivated"}
        </h3>
        
        <p className={`mb-6 ${success ? "text-green-600 font-medium" : "text-gray-600"}`}>
          {status || message}
        </p>

        {success ? (
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Login Now
          </button>
        ) : (
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReactivate}
              className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Reactivate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactivationModal;
