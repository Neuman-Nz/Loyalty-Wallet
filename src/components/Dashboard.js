import React, { useMemo, useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const currency = (n) => `KES ${Number(n).toFixed(2)}`;

export default function Dashboard() {
  const [balance, setBalance] = useState(4942.0);
  const [phone, setPhone] = useState("");
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

  // ✅ Redeem popup toggle
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

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
      alert("Enter a valid amount");
      return;
    }
    if (type === "send" && amt > balance) {
      alert("Insufficient balance");
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="p-5 flex items-center justify-between bg-white shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          Welcome
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
        <div className="w-[90%] max-w-md bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl transform hover:scale-[1.01] transition">
          <div className="flex justify-between items-center">
            {/* Redeem Points Button */}
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

        {/* Redeem Modal */}
        {isOpen && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl z-10">
            <div className="bg-white rounded-2xl p-6 w-72 shadow-lg text-gray-800">
              <h2 className="text-lg font-semibold mb-4">Redeem Points</h2>
              <div className="flex flex-col gap-3">
                <button className="w-full py-2 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition">
                  📶 Data
                </button>
                <button className="w-full py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition">
                  ☎️ Airtime
                </button>
                <button className="w-full py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition">
                  💵 Cash
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
              checked={phone === "my"}
              onChange={() => setPhone("my")}
              className="w-3.5 h-3.5 text-emerald-600 border-gray-300"
            />
            <span className="text-gray-800 text-xs font-medium">My Number</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="numberType"
              value="other"
              checked={phone === "other"}
              onChange={() => setPhone("other")}
              className="w-3.5 h-3.5 text-emerald-600 border-gray-300"
            />
            <span className="text-gray-800 text-xs font-medium">Other Number</span>
          </label>
        </div>

        {/* Phone input (only for Other Number) */}
        {phone === "other" && (
          <div className="w-full flex gap-2 mb-4">
            {/* Country Code */}
            <select
              className="border border-gray-200 rounded-lg px-2 py-2 text-xs shadow-sm
                        focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              defaultValue="+254"
            >
              <option value="+254">🇰🇪 +254</option>
              <option value="+255">🇹🇿 +255</option>
              <option value="+256">🇺🇬 +256</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>

            {/* Phone number */}
            <input
              type="tel"
              placeholder="Enter phone number"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm
                        focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>
        )}

        {/* Amount input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm mb-4
             focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
        />

        {/* Quick Select Buttons */}
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

        {/* Top Up Button */}
        <button
          onClick={() =>
            alert(`Top up ${amount} to ${phone === "my" ? "My Number" : "Other Number"}`)
          }
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg py-2 text-sm shadow transition"
        >
          TOP UP
        </button>
      </section>

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

function BudgetRow({ label, left, percent }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-slate-500">{left}</p>
        </div>
        <p className="text-lg font-bold text-blue-600">{percent}%</p>
      </div>
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export { Dashboard, currency };
