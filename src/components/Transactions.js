import React from "react";
import { useNavigate } from "react-router-dom";

const currency = (n) => `$${Number(n).toFixed(2)}`;

export default function Transactions() {
  const navigate = useNavigate();

  const transactions = [
    { id: 1, type: "receive", amount: 120.5, note: "Refund", date: "2025-08-10 12:30" },
    { id: 2, type: "send", amount: 45.0, note: "Taxi", date: "2025-08-11 09:12" },
    { id: 3, type: "send", amount: 80.0, note: "Groceries", date: "2025-08-13 17:45" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Transaction History</h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Back
        </button>
      </div>

      {/* Transactions list */}
      <ul className="space-y-3">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full grid place-items-center ${
                  t.type === "send"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {t.type === "send" ? "📤" : "📥"}
              </div>
              <div>
                <div className="font-medium">
                  {t.type === "send" ? "Sent" : "Received"} {currency(t.amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {t.note || "—"} · {t.date}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { currency };
