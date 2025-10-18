import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link — token is missing.");
        return;
      }

      try {
        const res = await axios.post(
          `https://traveltales-backend-nmyv.onrender.com/api/auth/verify-email?token=${token}`
        );
        setStatus("success");
        setMessage(res.data.message || "Your email has been successfully verified!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed. Please try again."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">
            Verifying your email, please wait...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl shadow-md p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
             Email Verified Successfully!
          </h2>
          <p className="text-gray-700 mb-4">{message}</p>
          
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
             Verification Failed
          </h2>
          <p className="text-gray-700 mb-4">{message}</p>
          
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
