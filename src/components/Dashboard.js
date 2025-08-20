import React, { useMemo, useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const currency = (n) => `KES ${Number(n).toFixed(2)}`;

export default function Dashboard() {
  const [balance, setBalance] = useState(4942.0);
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
        <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
          Loyalty Wallet
        </h1>
        <button
          onClick={handleToggleDetails}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Toggle card details visibility"
          title={showDetails ? "Hide card details" : "Reveal card details for 60 minutes"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 3H3v4M17 3h4v4M21 17v4h-4M3 17v4h4" />
          </svg>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Balance Card */}
        <section className="mt-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl transform hover:scale-[1.01] transition">
            <div className="flex justify-between items-center">
              <span className="bg-white/90 text-black px-3 py-1 text-xs font-medium rounded-full shadow">
                Master Card ▾
              </span>
              <span className="opacity-80 text-sm">
                {showDetails
                  ? `Visible ${expiresAt ? `(${formatMMSS(remainingMs)})` : ""}`
                  : "Active Wallet"}
              </span>
            </div>
            <div className="mt-6">
              <p className="text-sm opacity-80">Available Balance</p>
              <p className="text-4xl font-extrabold">{currency(balance)}</p>
            </div>
            <div className="mt-6 flex justify-between text-xs opacity-80">
              {showDetails ? (
                <>
                  <p>Exp. 08/26</p>
                  <p>Card 5679 1234 5678 9876</p>
                </>
              ) : (
                <>
                  <p>Exp. 08/26</p>
                  <p>Card 5679••••</p>
                </>
              )}
            </div>
            {showDetails && (
              <p className="mt-3 text-[11px] opacity-80">
                ⏳ Details auto-hide in {formatMMSS(remainingMs)}.
              </p>
            )}
          </div>
        </section>

       {/* Transaction Actions */}
      <section className="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-wide">
          Make a Transaction
        </h3>

        <div className="flex gap-3 mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleTx("send")}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-transform transform hover:-translate-y-0.5"
          >
            🚀 Send
          </button>
          <button
            onClick={() => handleTx("receive")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-transform transform hover:-translate-y-0.5"
          >
            💰 Receive
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600 font-medium">
          💸 Spent this month: <span className="font-semibold text-gray-900">{currency(spentThisMonth)}</span>
        </p>
      </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t flex items-center justify-around fixed bottom-0 left-0 right-0 shadow-md">
        <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition">
          <span className="text-lg">💳</span>
          <span className="text-xs font-medium">Cards</span>
        </button>
        <button
          onClick={() => navigate("/transactions")}
          className="flex flex-col items-center"
        >
          <div className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg text-white transition">
            ⌁
          </div>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition">
          <span className="text-lg">👤</span>
          <span className="text-xs font-medium">Account</span>
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
          <p className="text-sm text-gray-500">{left}</p>
        </div>
        <p className="text-lg font-bold text-indigo-600">{percent}%</p>
      </div>
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export { Dashboard, currency };
