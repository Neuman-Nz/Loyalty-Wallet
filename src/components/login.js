import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const countryCode = "+254";

  // ✅ Pre-fill with last phone after signup
  useEffect(() => {
    const lastPhone = localStorage.getItem("lastPhone");
    if (lastPhone) {
      // remove 254 prefix for input display
      setPhone(lastPhone.replace(/^254/, ""));
    }
  }, []);

  const handleRequestOtp = async () => {
    const cleanedPhone = phone.trim().replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length < 9) {
      window.alert("Please enter a valid phone number");
      return;
    }

    const fullPhone = countryCode + cleanedPhone;

    try {
      setLoading(true);

      const res = await fetch(
        "https://loyalty-1048592730476.europe-west4.run.app/public/auth/request-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone }),
        }
      );

      if (!res.ok) throw new Error("Failed to send OTP");

      window.alert("OTP sent to your phone.");
      navigate("/verify", { state: { phone: fullPhone } }); // ✅ absolute path
    } catch (err) {
      console.error(err);
      window.alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="flex justify-center pt-16 pb-6">
        <img
          src="https://i.postimg.cc/hj42rGqy/PEAK-LOGO-RAW-FILES-03.png"
          alt="Logo"
          className="w-40 h-40 object-contain"
        />
      </div>

      {/* Form */}
      <div className="flex flex-col items-center px-6 flex-1">
        <h1 className="text-2xl font-bold text-[#0a1d44] mb-6">Login</h1>

        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full max-w-sm mb-4">
          <div className="flex items-center bg-gray-100 px-3 border-r border-gray-300 h-11">
            <img
              src="https://flagcdn.com/w40/ke.png"
              alt="KE Flag"
              className="w-6 h-4 mr-2"
            />
            <span className="font-semibold text-[#0a1d44]">{countryCode}</span>
          </div>
          <input
            type="tel"
            placeholder="712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-3 h-11 outline-none"
            maxLength={12}
          />
        </div>

        <button
          onClick={handleRequestOtp}
          disabled={loading}
          className={`w-full max-w-sm py-3 rounded-lg font-bold text-white ${
            loading ? "bg-gray-500" : "bg-[#0a1d44] hover:bg-[#132b63]"
          }`}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
