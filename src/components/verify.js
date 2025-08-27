import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || ""; // passed from login/register
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || !phone) return alert("Enter the OTP code");

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
      console.log("Verify response:", data);

      // Assuming backend sends user info in data.user
      const firstName = data.user?.firstName || "";
      const lastName = data.user?.lastName || "";

      alert("Logged in successfully");

      // Pass user details to dashboard
      navigate("/dashboard", {
        state: { firstName, lastName, phone },
      });
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <img
        src="https://i.postimg.cc/hj42rGqy/PEAK-LOGO-RAW-FILES-03.png"
        alt="Logo"
        className="w-32 mb-6"
      />
      <h2 className="text-xl font-bold">Enter OTP</h2>
      <p className="text-gray-600 mb-4">Code sent to {phone}</p>

      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit OTP code"
        className="border p-3 rounded text-center tracking-widest w-64 mb-3"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-blue-900 text-white font-bold px-6 py-3 rounded w-64"
      >
        {loading ? "Verifying..." : "Login"}
      </button>

      <button
        onClick={() => alert("Resend OTP coming soon!")}
        className="mt-4 text-blue-900 font-medium"
      >
        Didn’t get the code? Resend OTP
      </button>
    </div>
  );
}
