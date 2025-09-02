import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || ""; // passed from login/register
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
      console.log("Verify response:", data);

      const firstName = data.user?.firstName || "";
      const lastName = data.user?.lastName || "";

      window.alert("Logged in successfully");

      navigate("/dashboard", {
        state: { firstName, lastName, phone },
      });
    } catch (err) {
      console.error(err);
      window.alert("Error: " + (err.message || "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96 text-center">
        <img
          src="https://i.postimg.cc/cLZTmCb1/wal-logo.jpg"
          alt="Logo"
          className="w-48 mx-auto mb-6" // 🔹 Increased size
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
          className="bg-blue-900 text-white font-bold px-6 py-3 rounded-lg w-full hover:bg-blue-800 transition"
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
    </div>
  );
}
