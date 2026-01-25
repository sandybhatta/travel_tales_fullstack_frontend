import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import photo1 from "../photos/register/1.jpg";
import photo2 from "../photos/register/2.jpg";
import photo3 from "../photos/register/3.jpg";
import photo4 from "../photos/register/4.jpg";
import { Link } from "react-router-dom";

const images = [
  { 
    src: photo1, 
    text: "Jobs fill your pockets, but adventures fill your soul." 
  },
  { 
    src: photo2, 
    text: "The world is a book, and those who do not travel read only one page." 
  },
  { 
    src: photo3, 
    text: "Collect moments, not things — the best stories are found between the pages of a passport." 
  },
  { 
    src: photo4, 
    text: "Take only memories, leave only footprints." 
  },
];

const RegisterUser = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    location: { city: "", state: "", country: "" },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const [strength, setStrength] = useState(0);
  const [charTypes, setCharTypes] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const timerRef = useRef(null);

  // Smooth carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000); // slightly slower for better readability
    return () => clearInterval(interval);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!isSubmitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" + secs : secs}s`;
  };

  function calculatePasswordStrength(password) {
    let score = 0;
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSpecial = false;
    const specials = ["~", "!", "@", "#", "$", "%", "^", "&", "*"];

    if (password.length >= 8) score++;
    for (const char of password) {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) hasUpper = true;
      else if (code >= 97 && code <= 122) hasLower = true;
      else if (code >= 48 && code <= 57) hasNumber = true;
      else if (specials.includes(char)) hasSpecial = true;
    }
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    return { score, types: { hasUpper, hasLower, hasNumber, hasSpecial } };
  }

  const getBarColor = (index) => {
    if (strength > index) {
        if (strength <= 2) return "bg-red-500";
        if (strength === 3) return "bg-yellow-500";
        return "bg-green-500";
    }
    return "bg-gray-200";
  };

  const handleForm = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "password") {
      const { score, types } = calculatePasswordStrength(value);
      setStrength(score);
      setCharTypes(types);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (
      !form.name ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.location.city ||
      !form.location.state ||
      !form.location.country
    ) {
      setError("Please fill out all fields.");
      return;
    }
    if (strength < 4) {
      setError("Password too weak. Please meet all requirements.");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_LIVE_URL}/api/auth/register`, form);
      setSuccess(res.data.message || "Registration successful!");
      setIsSubmitted(true);
      setTimeLeft(30 * 60);
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    }
  };

  const handleResendEmail = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_LIVE_URL}/api/auth/resend-verification`, {
        email: form.email,
      });
      setSuccess("Verification email resent! Check your inbox.");
      setTimeLeft(30 * 60);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend email.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins overflow-hidden">
      
      {/* LEFT SIDE - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100 animate-fadeIn">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Create Account</h2>
            <p className="text-gray-500 text-sm">Join TravelTales and start your journey today</p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Name Input */}
            <div className="relative group">
              <i className='bx bx-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 text-xl transition-colors'></i>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleForm}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm font-medium"
              />
            </div>

            {/* Email & Username Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <i className='bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 text-xl transition-colors'></i>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleForm}
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm font-medium"
                    />
                </div>
                <div className="relative group">
                    <i className='bx bx-at absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 text-xl transition-colors'></i>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleForm}
                        placeholder="Username"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Password Section */}
            <div className="relative group">
              <i className='bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 text-xl transition-colors'></i>
              <input
                type={passwordShow ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleForm}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm font-medium"
              />
              <button 
                onClick={() => setPasswordShow(!passwordShow)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
              >
                <i className={`bx ${passwordShow ? 'bx-show' : 'bx-hide'} text-xl`}></i>
              </button>
            </div>

            {/* Strength Bar */}
            <div className="flex gap-2 h-1.5 mt-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${getBarColor(i)}`}
                ></div>
              ))}
            </div>
            
            {/* Password Requirements - Mini Tags */}
            <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-md border ${form.password.length >= 8 ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>8+ chars</span>
                <span className={`text-[10px] px-2 py-1 rounded-md border ${charTypes.hasUpper && charTypes.hasLower ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>Aa</span>
                <span className={`text-[10px] px-2 py-1 rounded-md border ${charTypes.hasNumber ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>123</span>
                <span className={`text-[10px] px-2 py-1 rounded-md border ${charTypes.hasSpecial ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>#$&</span>
            </div>

            {/* Location Inputs */}
            <div className="grid grid-cols-3 gap-3">
                 <div className="relative group">
                    <i className='bx bx-buildings absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg'></i>
                    <input
                        type="text"
                        name="location.city"
                        value={form.location.city}
                        onChange={handleForm}
                        placeholder="City"
                        className="w-full pl-8 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-xs sm:text-sm"
                    />
                </div>
                <div className="relative group">
                     <i className='bx bx-map-alt absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg'></i>
                    <input
                        type="text"
                        name="location.state"
                        value={form.location.state}
                        onChange={handleForm}
                        placeholder="State"
                        className="w-full pl-8 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-xs sm:text-sm"
                    />
                </div>
                <div className="relative group">
                     <i className='bx bx-globe absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg'></i>
                    <input
                        type="text"
                        name="location.country"
                        value={form.location.country}
                        onChange={handleForm}
                        placeholder="Country"
                        className="w-full pl-8 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-xs sm:text-sm"
                    />
                </div>
            </div>

            {/* Feedback Messages */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                    <i className='bx bx-error-circle text-xl'></i>
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-600 text-sm">
                    <i className='bx bx-check-circle text-xl'></i>
                    {success}
                </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={strength < 4 || isSubmitted}
              className={`mt-2 w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-green-200 transform transition-all duration-300 flex items-center justify-center gap-2 ${
                strength < 4 || isSubmitted
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              {isSubmitted ? (
                <>
                   <i className='bx bx-envelope'></i> Verification Sent
                </>
              ) : (
                <>
                   Sign Up <i className='bx bx-right-arrow-alt'></i>
                </>
              )}
            </button>

             {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 font-bold hover:underline">
                    Log in
                </Link>
            </p>

            {/* Resend Logic */}
            {isSubmitted && (
               <div className="text-center pt-2 border-t border-gray-100 mt-2">
                 <p className="text-xs text-gray-400 mb-2">
                   {timeLeft > 0 ? `Resend available in ${formatTime(timeLeft)}` : "Didn't receive code?"}
                 </p>
                 <button
                    onClick={handleResendEmail}
                    disabled={timeLeft > 0}
                    className={`text-sm font-medium ${timeLeft > 0 ? 'text-gray-300' : 'text-green-600 hover:underline'}`}
                 >
                    Resend Verification Email
                 </button>
               </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Carousel */}
      <div className="hidden lg:block w-1/2 relative h-screen">
        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none"></div> {/* Dark overlay for text readability */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === imageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img.src}
              alt="Travel Background"
              className="w-full h-full object-cover"
            />
             {/* Quote Overlay */}
            <div className="absolute bottom-20 left-10 right-10 z-20 text-white">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl inline-block">
                     <p className="text-2xl font-bold leading-relaxed drop-shadow-md font-serif italic">
                        "{img.text}"
                    </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisterUser;
