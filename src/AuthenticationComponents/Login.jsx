import React, { useRef, useState } from "react";
import axios from "axios";
import OtpVerification from "./OtpVerification.jsx";
import ReactivationModal from "./ReactivationModal.jsx";
import ForgotPassword from "./ForgotPassword";

const API_BASE = "https://traveltales-backend-nmyv.onrender.com/api/auth"; 

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [stage, setStage] = useState("login"); // login | otp | forgot | reset
  const [userId, setUserId] = useState(null);
  const [reactivateData, setReactivateData] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      setUserId(res.data.userId);
      setStage("otp");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      if (err.response?.data?.allowReactivation) {
        setReactivateData({
          userId: err.response.data.userId,
          message: msg,
        });
      } else {
        setError(msg);
      }
    }
  };

  if (stage === "otp") {
    return <OtpVerification   userId={userId} onBack={() => setStage("login")} />;
  }

  if (stage === "forgot") {
    return <ForgotPassword onBack={() => setStage("login")} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>

        <input
          ref={emailRef}
          type="email"
          placeholder="Email"
          className="w-full mb-3 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          className="w-full mb-4 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setStage("forgot")}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {reactivateData && (
        <ReactivationModal
          {...reactivateData}
          onClose={() => setReactivateData(null)}
        />
      )}
    </div>
  );
};

export default Login;
