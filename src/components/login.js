import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpSent, setShowOtpSent] = useState(false); // ✅ modal toggle
  const countryCode = "+254";

  // ✅ Pre-fill with last phone after signup
  useEffect(() => {
    const lastPhone = localStorage.getItem("lastPhone");
    if (lastPhone) {
      setPhone(lastPhone.replace(/^254/, "")); // remove 254 prefix for input
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

      // ✅ Show styled success popup
      setShowOtpSent(true);
    } catch (err) {
      console.error(err);
      window.alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOtpPopup = () => {
    setShowOtpSent(false);
    navigate("/verify", { state: { phone: countryCode + phone } }); // ✅ continue
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="flex justify-center pt-16 pb-6">
        <img
          src="https://i.postimg.cc/cLZTmCb1/wal-logo.jpg"
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
            className="flex-1 px-3 h-11 outline-none placeholder-gray-400 text-gray-700"
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

        {/* 👇 Register Instead */}
        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-[#0a1d44] font-semibold hover:underline"
          >
            Register instead
          </button>
        </p>
      </div>

      {/* ✅ OTP Sent Popup */}
      {showOtpSent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center animate-fadeIn">
            <img
              src="https://i.postimg.cc/cLZTmCb1/wal-logo.jpg"
              alt="Logo"
              className="w-48 mx-auto mb-6"
            />
            <h3 className="text-xl font-bold text-[#0a1d44] mb-2">
              📲 OTP Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              We’ve sent a one-time password to{" "}
              <span className="font-semibold">
                {countryCode}
                {phone}
              </span>
              . Enter it on the next screen.
            </p>
            <button
              onClick={handleCloseOtpPopup}
              className="w-full py-2 bg-[#0a1d44] text-white rounded-lg font-semibold hover:bg-[#122c66]"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
