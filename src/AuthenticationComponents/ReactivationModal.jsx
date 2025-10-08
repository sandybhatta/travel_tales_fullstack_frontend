import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const ReactivationModal = ({ userId, message, onClose }) => {
  const [status, setStatus] = useState("");

  const handleReactivate = async () => {
    try {
      const res = await axios.post(`${API_BASE}/reactivate-user`, { userId });
      setStatus(res.data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || "Reactivation failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm text-center">
        <h3 className="font-bold text-lg mb-2 text-gray-800">Account Deactivated</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {status && <p className="text-green-600 mb-3">{status}</p>}
        <button
          onClick={handleReactivate}
          className="bg-green-500 text-white py-2 px-4 rounded-lg mr-2"
        >
          Reactivate
        </button>
        <button onClick={onClose} className="text-gray-500 underline">
          Close
        </button>
      </div>
    </div>
  );
};

export default ReactivationModal;
