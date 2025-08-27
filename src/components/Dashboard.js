import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const currency = (n) => `KES ${Number(n).toFixed(2)}`;

// --- Helpers to read + normalize user details from storage ---
const getFirstNameFromUser = (u) => {
  if (!u || typeof u !== "object") return "";
  // Try common keys first, fall back to splitting "name"
  return (
    u.first_name ||
    u.firstName ||
    u.given_name ||
    (typeof u.name === "string" ? u.name.split(" ")[0] : "")
  );
};

// Always return KE format without "+" -> 2547XXXXXXXX
const normalizeKePhone = (input) => {
  if (!input) return "";
  const digits = String(input).replace(/\D/g, "");
  // If already like 2547XXXXXXXX, clamp to 12 digits
  if (digits.startsWith("254") && digits.length >= 12) {
    return digits.slice(0, 12);
  }
  // Use last 9 digits as the subscriber number, then prefix 254
  const last9 = digits.slice(-9); // e.g. 712345678
  return last9 ? "254" + last9 : "";
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Load once from localStorage and normalize
  const [profile, setProfile] = useState({ firstName: "User", phone: "" });

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : {};
      const storedFallbackPhone =
        localStorage.getItem("lastPhone") || user.msisdn || user.ACCOUNT;

      const firstName =
        getFirstNameFromUser(user) ||
        user?.first_name ||
        user?.firstName ||
        "User";

      const normalizedPhone = normalizeKePhone(
        user?.phone || user?.msisdn || storedFallbackPhone || ""
      );

      setProfile({
        firstName,
        phone: normalizedPhone, // will look like 2547XXXXXXXX
      });
    } catch (e) {
      console.error("Failed to read user from localStorage:", e);
      setProfile({ firstName: "User", phone: "" });
    }
  }, []);

  const [balance, setBalance] = useState(4942.0);
  const [phoneChoice, setPhoneChoice] = useState("my"); // "my" | "other"
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([
    { id: 1, type: "receive", amount: 120.5, date: new Date().toLocaleString() },
    { id: 2, type: "send", amount: 45.0, date: new Date().toLocaleString() },
  ]);

  const [showDetails, setShowDetails] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [hideTimeoutId, setHideTimeoutId] = useState(null);
  const [tickIntervalId, setTickIntervalId] = useState(null);

  const [isOpen, setIsOpen] = useState(false); // redeem popup
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const spentThisMonth = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "send")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const handleTx = (type) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: "error", message: "Enter a valid amount" });
      return;
    }
    if (type === "send" && amt > balance) {
      setFeedback({ type: "error", message: "Insufficient balance" });
      return;
    }
    setBalance((b) => (type === "send" ? b - amt : b + amt));
    setTransactions((list) => [
      { id: Date.now(), type, amount: amt, date: new Date().toLocaleString() },
      ...list,
    ]);
    setAmount("");
  };

  const handleToggleDetails = () => {
    if (hideTimeoutId) clearTimeout(hideTimeoutId);
    if (tickIntervalId) clearInterval(tickIntervalId);

    if (!showDetails) {
      const exp = Date.now() + 60 * 60 * 1000;
      setShowDetails(true);
      setExpiresAt(exp);
      setRemainingMs(exp - Date.now());

      const hid = setTimeout(() => {
        setShowDetails(false);
        setExpiresAt(null);
        setRemainingMs(0);
      }, 60 * 60 * 1000);
      setHideTimeoutId(hid);

      const iid = setInterval(() => {
        const next = (expiresAt ?? exp) - Date.now();
        setRemainingMs(next > 0 ? next : 0);
      }, 1000);
      setTickIntervalId(iid);
    } else {
      setShowDetails(false);
      setExpiresAt(null);
      setRemainingMs(0);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
      if (tickIntervalId) clearInterval(tickIntervalId);
    };
  }, [hideTimeoutId, tickIntervalId]);

  const formatMMSS = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  // --- Payment ---
  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setFeedback({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    let msisdn = "";

    if (phoneChoice === "my") {
      // ✅ Use normalized stored phone in 2547XXXXXXXX format
      msisdn = profile.phone;
    } else {
      const prefix = document.querySelector("#countryCode")?.value || "+254";
      let number = document.querySelector("#otherPhone")?.value || "";

      // Normalize "other" input to digits and to 2547XXXXXXXX as well
      const digits = (prefix + number).replace(/\D/g, "");
      msisdn = normalizeKePhone(digits);
    }

    if (!msisdn) {
      setFeedback({ type: "error", message: "Enter a valid phone number" });
      return;
    }

    const payload = { msisdn, amount: Number(amount) };
    console.log("Payment payload:", payload);

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(
        "https://loyalty-1048592730476.europe-west4.run.app/public/payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.json();
      console.log("Raw Payment response:", raw);

      const data = raw?.data ? raw.data : raw;

      if (res.ok) {
        setFeedback({
          type: "success",
          message: data?.stk_push?.CustomerMessage || "Payment request sent!",
        });

        setTransactions((list) => [
          {
            id: data.payment?.id || Date.now(),
            type: "send",
            amount: Number(amount),
            date: new Date().toLocaleString(),
          },
          ...list,
        ]);
        setAmount("");
      } else {
        setFeedback({
          type: "error",
          message: data?.message || "Payment failed",
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "Network error while processing payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="p-5 flex items-center justify-between bg-white shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          {/* ✅ First name from registration */}
          Welcome, {profile.firstName}
        </h1>
        <button
          onClick={handleToggleDetails}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Toggle card details visibility"
          title={showDetails ? "Hide card details" : "Reveal card details for 60 minutes"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 3H3v4M17 3h4v4M21 17v4h-4M3 17v4h4" />
          </svg>
        </button>
      </header>

      {/* Balance Card Section */}
      <section className="mt-6 flex justify-center relative">
        <div className="w-[90%] max-w-md bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-white/90 text-black px-3 py-1 text-xs font-medium rounded-full shadow hover:bg-white transition"
            >
              Redeem Points
            </button>
            <span className="opacity-80 text-sm">
              {showDetails
                ? `Visible ${expiresAt ? `(${formatMMSS(remainingMs)})` : ""}`
                : "Active Wallet"}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm opacity-80">Points Balance</p>
            <p className="text-4xl font-extrabold">{balance}</p>
          </div>
          <div className="mt-6 flex justify-between text-xs opacity-80">
            <p>Value - Ksh. 123</p>
          </div>
          {showDetails && (
            <p className="mt-3 text-[11px] opacity-80">
              ⏳ Details auto-hide in {formatMMSS(remainingMs)}.
            </p>
          )}
        </div>
      </section>

      {/* Top Up Section */}
      <section className="mt-4 bg-white rounded-xl shadow p-3">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Top Up</h3>

        {/* Number Selection */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="numberType"
              value="my"
              checked={phoneChoice === "my"}
              onChange={() => setPhoneChoice("my")}
              className="w-3.5 h-3.5 text-emerald-600 border-gray-300"
            />
            <span className="text-gray-800 text-xs font-medium">
              {/* ✅ Show normalized KE phone */}
              My Number {profile.phone ? `(${profile.phone})` : ""}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="numberType"
              value="other"
              checked={phoneChoice === "other"}
              onChange={() => setPhoneChoice("other")}
              className="w-3.5 h-3.5 text-emerald-600 border-gray-300"
            />
            <span className="text-gray-800 text-xs font-medium">Other Number</span>
          </label>
        </div>

        {/* Other phone input */}
        {phoneChoice === "other" && (
          <div className="w-full flex gap-2 mb-4">
            <select
              id="countryCode"
              defaultValue="+254"
              className="border rounded-lg px-2 py-2 text-xs shadow-sm"
            >
              <option value="+254">🇰🇪 +254</option>
              <option value="+255">🇹🇿 +255</option>
              <option value="+256">🇺🇬 +256</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>
            <input
              id="otherPhone"
              type="tel"
              placeholder="Enter phone number"
              className="flex-1 border rounded-lg px-3 py-2 text-xs shadow-sm"
            />
          </div>
        )}

        {/* Amount input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border rounded-lg px-3 py-2 text-xs shadow-sm mb-4"
        />

        {/* Quick Select */}
        <div className="flex flex-wrap gap-1 mb-3">
          {[20, 50, 100, 200, 500, 1000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`px-3 py-1 rounded-full border text-xs transition
                ${
                  Number(amount) === val
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              {val}
            </button>
          ))}
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg py-2 text-sm shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "TOP UP"}
        </button>
      </section>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
            <h2
              className={`text-lg font-bold mb-3 ${
                feedback.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {feedback.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-gray-700 text-sm">{feedback.message}</p>
            <button
              onClick={() => setFeedback(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t flex items-center justify-around fixed bottom-0 left-0 right-0 shadow-md">
        <button
          onClick={() => navigate("/transactions")}
          className="flex flex-col items-center"
        >
          <div className="h-14 w-14 bg-blue-600 hover:bg-blue-700 rotate-45 rounded-[20%] flex items-center justify-center shadow-lg text-white text-2xl transition">
            <span className="-rotate-45">⌁</span>
          </div>
        </button>
      </nav>
    </div>
  );
}

export { Dashboard, currency };
