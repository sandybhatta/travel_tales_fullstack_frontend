import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../slices/authApiSlice.js";

const ResetPasswordOtp = ({ email, onBack }) => {
    const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetPassword] = useResetPasswordMutation();

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    if (!otp || !newPassword || !email) {
      setError("Please provide OTP, new password, and email.");
      return;
    }

    try {
      const res = await resetPassword({
        token: otp,
        password: newPassword,
        email,
      }).unwrap();
      setMessage(res.message || "Password changed successfully!");
      setError("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.data?.message || "Password reset failed");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="border p-3 w-full rounded-lg mb-3"
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="border p-3 w-full rounded-lg mb-3"
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <button
          onClick={handleResetPassword}
          className="bg-green-500 text-white py-2 w-full rounded-lg mb-3 hover:bg-green-600 transition"
        >
          Reset Password
        </button>

        <button
          onClick={onBack}
          className="text-gray-500 text-sm hover:underline"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordOtp;
