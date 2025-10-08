import React, { useRef, useState } from "react";
import MainLogo from "../MainLogo.jpg";

const Login = () => {
  const [email,setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setpasswordShow] = useState(false);
  const [error,setError] = useState("")


  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gradient-to-br from-green-50 to-blue-100">

      {/* IMAGE SIDE — visible only on large screens (desktop and above) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-white shadow-xl">
        <img
          src={MainLogo}
          alt="Travel Tales Logo"
          className="object-cover w-full h-full"
        />
      </div>

      {/* FORM SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12">
        <div className="bg-white rounded-3xl shadow-3xl p-10 sm:p-12 w-full max-w-lg flex flex-col gap-8">

          <h2 className="text-center text-3xl sm:text-4xl font-bold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
            Login to TravelTales
          </h2>

          {/* Email Input */}
          <div className="flex flex-col">
            <label className="text-[1.5rem] font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 text-[1.5 rem]"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="text-[1.5rem] font-semibold text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordShow ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-[1.5 rem]"
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordShow}
                  onChange={() => setpasswordShow(!passwordShow)}
                  className="w-4 h-4 accent-green-500 cursor-pointer"
                />
                <span className="text-xs text-gray-600">Show</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={!email || !password}
            className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Login
          </button>

          {/* Extra links */}
          <div className="text-center text-xl text-gray-600 mt-3">
            Don’t have an account?{" "}
            <a
              href="/register-user"
              className="text-blue-500 font-semibold hover:underline"
            >
              Register here
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
