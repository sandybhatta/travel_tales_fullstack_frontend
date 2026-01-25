import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import mainApi from "../Apis/axios";

const VerifyEmailChange = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your new email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        // Backend expects token in query param: req.query.token
        // But the route is POST /api/user/verify-email-change
        // And my current URL is /verify-email-change?token=XYZ
        
        // So I need to call the backend with the token in query params
        await mainApi.post(`/api/user/verify-email-change?token=${token}`);
        
        setStatus("success");
        setMessage("Email updated successfully! Redirecting...");
        
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. Link may be expired.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-check text-3xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-green-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Go Home Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-x text-3xl text-red-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-red-500 mb-6">{message}</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailChange;
