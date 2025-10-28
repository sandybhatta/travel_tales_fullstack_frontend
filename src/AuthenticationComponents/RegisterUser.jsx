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
  const [timeLeft, setTimeLeft] = useState(30*60);
  const timerRef = useRef(null);

  // Smooth carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000); // change every 4 seconds
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

  const getBarColor = () => {
    if (strength <= 1) return "bg-red-700";
    if (strength === 2) return "bg-orange-400";
    if (strength === 3) return "bg-yellow-400";
    if (strength === 4) return "bg-green-400";
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
      setError("Password too weak. Try adding uppercase, numbers, and symbols.");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, form);
      setSuccess(res.data.message || "Registration successful!");
      setIsSubmitted(true);
      setTimeLeft(30*60);
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    }
  };

  const handleResendEmail = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-verification`, {
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
    <div className="absolute top-0 left-0 right-0 flex flex-col lg:flex-row min-h-screen">
      {/* LEFT SIDE - Registration Form */}
      <div className="w-full lg:w-1/3 mx-auto mt-8 lg:mt-0 p-6 rounded-xl shadow-md flex flex-col gap-3 z-10 bg-white/80 backdrop-blur-md">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          Create Your Account
        </h2>
  
        {/* Inputs */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleForm}
          placeholder="Name"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleForm}
          placeholder="Email"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleForm}
          placeholder="Username"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
  
        {/* Password Section */}
        <div className="flex items-center justify-between">
          <input
            type={passwordShow ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleForm}
            placeholder="Password"
            className="p-3 rounded-md border-2 border-stone-600 w-[75%] focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
          />
          <label className="text-sm sm:text-base text-gray-700 flex items-center gap-1">
            <input
              type="checkbox"
              checked={passwordShow}
              onChange={() => setPasswordShow(!passwordShow)}
              className="accent-green-500 w-5 h-5 sm:w-6 sm:h-6"
            />
            Show
          </label>
        </div>
  
        {/* Strength Bar */}
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-[6px] flex-1 rounded-sm transition-all duration-300 ${
                strength >= i ? getBarColor() : "bg-stone-600"
              }`}
            ></div>
          ))}
        </div>
  
        {/* Location Inputs */}
        <input
          type="text"
          name="location.city"
          value={form.location.city}
          onChange={handleForm}
          placeholder="City"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
        <input
          type="text"
          name="location.state"
          value={form.location.state}
          onChange={handleForm}
          placeholder="State"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
        <input
          type="text"
          name="location.country"
          value={form.location.country}
          onChange={handleForm}
          placeholder="Country"
          className="p-3 rounded-md border-2 border-stone-600 w-full focus:outline-none focus:ring-2 focus:ring-stone-600 text-lg sm:text-xl"
        />
  
  <div className="text-center mt-4 text-xl">
  <Link 
    to="/login" 
    className="text-green-700 font-medium hover:text-green-500 transition-colors duration-200"
  >
    Already have an account? Login here
  </Link>
</div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={strength < 4}
          className={`mt-3 p-3 text-lg sm:text-xl rounded-md font-semibold text-white transform hover:scale-105 transition duration-300 ${
            strength < 4
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-500"
          }`}
        >
          Submit
        </button>

  
        {/* Verification Section */}
        {isSubmitted && (
          <div className="mt-3 text-center">
            <p className="text-gray-700 text-base sm:text-lg">
              {timeLeft > 0
                ? `Verification email expires in ${formatTime(timeLeft)}`
                : "Verification link expired."}
            </p>
            <button
              onClick={handleResendEmail}
              disabled={timeLeft > 0}
              className={`mt-2 w-full px-3 py-2 rounded-md text-base sm:text-lg font-medium transition ${
                timeLeft > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Resend Verification Email
            </button>
          </div>
        )}
  
        {/* Messages */}
        {error && <p className="text-red-600 text-center text-sm">{error}</p>}
        {success && <p className="text-green-600 text-center text-sm">{success}</p>}
  
        {/* Password Requirements */}
        <ul className="list-none text-2xl mt-2 space-y-1 " >
          <li className={form.password.length >= 8 ? "text-green-600" : "text-red-600"}>
            At least 8 characters long
          </li>
          <li
            className={
              charTypes.hasUpper && charTypes.hasLower
                ? "text-green-600"
                : "text-red-600"
            }
          >
            Has both uppercase and lowercase letters
          </li>
          <li className={charTypes.hasNumber ? "text-green-600" : "text-red-600"}>
            Contains numbers
          </li>
          <li className={charTypes.hasSpecial ? "text-green-600" : "text-red-600"}>
            Contains special characters (~!@#$%^&*)
          </li>
        </ul>
      </div>
  
      {/* RIGHT SIDE - Carousel (Hidden on small screens) */}
      <div className="hidden lg:block relative w-2/3 h-screen overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === imageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img.src}
              alt={img.text}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-2/3 h-full mt-[2rem] ">
              <p className=" text-white text-3xl xl:text-4xl font-semibold text-center px-6  ">
                {img.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default RegisterUser;
