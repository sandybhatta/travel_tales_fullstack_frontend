import React, { useState } from "react";
import axios from "axios";
import ResetPasswordOtp from "./ResetPasswordOtp";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

const ForgotPassword = ({ onBack }) => {
  const [stage, setStage] = useState("email"); // "email" or "reset"
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/forget-password`, { email });
      setMessage(res.data.message || "OTP sent to your email.");
      setUserEmail(email);
      setStage("reset"); // move to OTP + new password step
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    }
  };

  if (stage === "reset") {
    return (
      <ResetPasswordOtp
        email={userEmail}
        onBack={() => setStage("email")}
      />
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-3 w-full rounded-lg mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <button
          onClick={handleSend}
          className="bg-green-500 text-white py-2 w-full rounded-lg mb-3 hover:bg-green-600 transition"
        >
          Send Reset OTP
        </button>
        <button
          onClick={onBack}
          className="text-gray-500 text-sm hover:underline"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
