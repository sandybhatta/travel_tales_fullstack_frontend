import React, { useState } from "react";
import axios from "axios";
import "./RegisterUser.css";

const RegisterUser = () => {
  // --- State Hooks ---
  const [progress, setProgress] = useState(0);
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

  // --- Helper Functions ---
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

    
    const typeCount =
      (hasUpper ? 1 : 0) +
      (hasLower ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecial ? 1 : 0);

    if (typeCount < 2 && score > 1) score--;

    return { score, types: { hasUpper, hasLower, hasNumber, hasSpecial } };
  }

  const getBarColor = () => {
    if (strength <= 1) return "red";
    if (strength === 2) return "orange";
    if (strength === 3) return "gold";
    if (strength === 4) return "green";
  };

  // --- Event Handlers ---
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

    // Live password strength calculation
    if (name === "password") {
      const { score, types } = calculatePasswordStrength(value);
      setStrength(score);
      setCharTypes(types);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // --- Validation Checks ---
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

    // --- Name should not have numbers ---
    const hasNumberInName = form.name.split("").some((char) => {
      const code = char.charCodeAt(0);
      return code >= 48 && code <= 57;
    });
    if (hasNumberInName) {
      setError("Name should not contain numbers.");
      return;
    }

    // --- Password strength ---
    if (strength < 4) {
      setError(
        "Password is too weak. Try adding numbers, uppercase letters, and special characters."
      );
      return;
    }

    // --- API Call ---
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form, {
        onUploadProgress: (e) => {
          const uploaded = Math.round((e.loaded * 100) / e.total);
          setProgress(uploaded);
        },
      });

      setSuccess(res.data.message || "Registration successful!");
      setForm({
        name: "",
        email: "",
        username: "",
        password: "",
        location: { city: "", state: "", country: "" },
      });
      setStrength(0);
      setCharTypes({ hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false });
      setProgress(0);
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    }
  };

  // --- JSX ---
  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>

      <input
        type="text"
        required
        name="name"
        value={form.name}
        onChange={handleForm}
        placeholder="Name"
      />

      <input
        type="email"
        required
        name="email"
        value={form.email}
        onChange={handleForm}
        placeholder="Email"
      />

      <input
        type="text"
        required
        name="username"
        value={form.username}
        onChange={handleForm}
        placeholder="Username"
        minLength={3}
        maxLength={15}
      />

      <div className="password-section">
        <input
          type={passwordShow ? "text" : "password"}
          required
          name="password"
          value={form.password}
          onChange={handleForm}
          placeholder="Password"
        />
        <label className="show-password">
          <input
            type="checkbox"
            checked={passwordShow}
            onChange={() => setPasswordShow(!passwordShow)}
          />{" "}
          Show
        </label>
      </div>

      {/* Strength Bar */}
      <div className="strength-bar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bar"
            style={{
              backgroundColor: strength >= i ? getBarColor() : "#ccc",
            }}
          ></div>
        ))}
      </div>

      <input
        type="text"
        required
        name="location.city"
        value={form.location.city}
        onChange={handleForm}
        placeholder="City"
      />
      <input
        type="text"
        required
        name="location.state"
        value={form.location.state}
        onChange={handleForm}
        placeholder="State"
      />
      <input
        type="text"
        required
        name="location.country"
        value={form.location.country}
        onChange={handleForm}
        placeholder="Country"
      />

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={strength < 4}
      >
        Submit
      </button>

      {progress > 0 && (
        <progress value={progress} max="100" className="upload-progress"></progress>
      )}

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <ul className="password-requirements">
        <li className={form.password.length >= 8 ? "valid" : "invalid"}>
          At least 8 characters long
        </li>
        <li className={charTypes.hasUpper && charTypes.hasLower ? "valid" : "invalid"}>
          Has both uppercase and lowercase letters
        </li>
        <li className={charTypes.hasNumber ? "valid" : "invalid"}>
          Contains numbers
        </li>
        <li className={charTypes.hasSpecial ? "valid" : "invalid"}>
          Contains special characters (~!@#$%^&*)
        </li>
      </ul>
    </div>
  );
};

export default RegisterUser;
