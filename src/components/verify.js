import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || ""; // passed from login/register
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ popup toggle

  const handleVerify = async () => {
    if (!code || !phone) {
      return window.alert("Enter the OTP code");
    }

    try {
      setLoading(true);
      const res = await fetch(
        "https://loyalty-1048592730476.europe-west4.run.app/public/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Verification failed");
      }

      const data = await res.json();
      console.log("Verify response:", data.access_token);

      if (data.access_token) {

          const decoded = jwtDecode(data.access_token);
          console.log("Decoded token:", decoded);
          const decodedPhone = decoded.msisdn; 
          const userId = decoded.sub;
          const name=data.user?.firstName || ""; 
          console.log("Name:", name);          
          console.log("Phone:", decodedPhone, "User ID:", userId);
          // localStorage.setItem("user_phone", decodedPhone);
          // localStorage.setItem("user_id", userId);
        }
      const firstName = data.user?.firstName || "";
      const lastName = data.user?.lastName || "";

      // ✅ Show popup instead of alert
      setShowSuccess(true);

      // ✅ Delay navigation slightly so user sees popup
      setTimeout(() => {
        navigate("/dashboard", {
          state: { firstName, lastName, phone },
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      window.alert("Error: " + (err.message || "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
      {/* OTP Card */}
      <div className="bg-white shadow-lg rounded-xl p-8 w-96 text-center">
        <img
          src="https://i.postimg.cc/cLZTmCb1/wal-logo.jpg"
          alt="Logo"
          className="w-48 mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
        <p className="text-gray-600 mb-6">Code sent to {phone}</p>

        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit OTP code"
          className="border p-3 rounded text-center tracking-widest w-full mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-[#0a1d44] text-white font-bold px-6 py-3 rounded-lg w-full hover:bg-[#0a1d44]/90 transition"
        >
          {loading ? "Verifying..." : "Log in"}
        </button>

        <button
          onClick={() => window.alert("Resend OTP coming soon!")}
          className="mt-4 text-blue-900 font-medium hover:underline"
        >
          Didn’t get the code? Resend OTP
        </button>
      </div>

      {/* ✅ Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center animate-fadeIn w-80">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Logged in Successfully
            </h3>
            <p className="text-gray-600 text-sm">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
