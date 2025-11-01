import React, { useState, useEffect } from "react";
import axios from "axios";
import {useDispatch} from "react-redux"
import {setAccessToken, setUserInformation} from "../slices/userSlice"
import { useNavigate } from "react-router-dom";
const API_BASE = `${import.meta.env.VITE_BACKEND_LIVE_URL}/api/auth`;


const OtpVerification = ({ userId, onBack  }) => {
    const dispatch = useDispatch()
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0); 
  const navigate = useNavigate();

  // countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${API_BASE}/otp-login`, { userId, otp }, { withCredentials: true });
      setMessage(" OTP verified! Login complete.");
      setError("");
      dispatch(setAccessToken(res.data.accessToken))
      dispatch(setUserInformation(res.data.user))
     
      navigate("/")

      
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
      setMessage("");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${API_BASE}/resend-otp`, { userId, type: "login" });
      setMessage(" A new OTP has been sent to your email.");
      setError("");
      setCooldown(600); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
      setMessage("");
    }
  };

  // Helper to format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-3 w-full rounded-lg mb-4"
          placeholder="6-digit OTP"
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <button
          onClick={handleVerify}
          className="bg-green-500 text-white py-2 w-full rounded-lg mb-3 hover:bg-green-600 transition"
        >
          Verify OTP
        </button>

        {/* Resend button with timer */}
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`${
            cooldown > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-500 hover:underline"
          } text-sm`}
        >
          {cooldown > 0
            ? `Resend OTP in ${formatTime(cooldown)}`
            : "Resend OTP"}
        </button>

        <button
          onClick={onBack}
          className="block mt-4 text-gray-500 text-sm hover:underline"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;

