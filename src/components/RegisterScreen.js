import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const countryCode = "254"; // no "+"

  const showAlert = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const handleSignup = async () => {
    const cleanedPhone = phone.trim().replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length < 9) {
      showAlert("Validation", "Please enter a valid phone number");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      showAlert("Validation", "Please enter both first and last names");
      return;
    }

    const fullPhone = countryCode + cleanedPhone;

    try {
      setLoading(true);

      const response = await fetch(
        "https://loyalty-1048592730476.europe-west4.run.app/public/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: fullPhone,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Signup failed. Try again.");
      }

      showAlert("Success", "Account registered.");
      localStorage.setItem("lastPhone", fullPhone);

      navigate("/login"); // ✅ absolute path
    } catch (error) {
      showAlert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Logo */}
      <div className="flex justify-center pt-16 pb-6">
        <img
          src="https://i.postimg.cc/hj42rGqy/PEAK-LOGO-RAW-FILES-03.png"
          alt="Logo"
          className="w-40 h-40 object-contain"
        />
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#0a1d44] mb-6 text-center">
          Sign Up
        </h2>

        {/* First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full h-11 border border-gray-300 rounded-lg px-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-[#0a1d44]"
        />

        {/* Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full h-11 border border-gray-300 rounded-lg px-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-[#0a1d44]"
        />

        {/* Phone */}
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden mb-5 bg-white">
          <div className="flex items-center px-3 bg-gray-100 h-11 border-r border-gray-300">
            <img
              src="https://flagcdn.com/w40/ke.png"
              alt="KE Flag"
              className="w-6 h-4 mr-2"
            />
            <span className="text-base font-semibold text-[#0a1d44]">
              {countryCode}
            </span>
          </div>
          <input
            type="tel"
            placeholder="712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={12}
            className="flex-1 h-11 px-3 text-base outline-none"
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white ${
            loading ? "bg-gray-500" : "bg-[#0a1d44] hover:bg-[#122c66]"
          }`}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
