import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowLeft } from "lucide-react";

export default function Transactions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("redeemed");
  const [transactions, setTransactions] = useState([]);

  // fetch from API
  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        "https://loyalty-1048592730476.europe-west4.run.app/api/v1/orgs/org-id/transactions"
      );
      const data = await res.json();
      if (res.ok) {
        setTransactions(data?.transactions || []);
      } else {
        console.error("Failed to fetch transactions", data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) =>
    activeTab === "gained" ? t.type === "gained" : t.type === "redeemed"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Points History</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={22} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center bg-gray-200 p-1 rounded-full mb-6">
        <button
          onClick={() => setActiveTab("gained")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            activeTab === "gained" ? "bg-white shadow text-gray-800" : "text-gray-500"
          }`}
        >
          Gained
        </button>
        <button
          onClick={() => setActiveTab("redeemed")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            activeTab === "redeemed" ? "bg-white shadow text-gray-800" : "text-gray-500"
          }`}
        >
          Redeemed
        </button>
      </div>

      {/* Transactions List */}
      <ul className="space-y-3">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full grid place-items-center ${
                  t.type === "redeemed" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                }`}
              >
                {t.type === "redeemed" ? "–" : "+"}
              </div>
              <div>
                <div className="font-medium text-sm">{t.note || "Transaction"}</div>
                <div className="text-xs text-gray-500">{t.subtext || ""}</div>
              </div>
            </div>
            <div className={`font-semibold ${t.points < 0 ? "text-red-500" : "text-green-500"}`}>
              {t.points}
            </div>
          </li>
        ))}
      </ul>

      {/* Date footer */}
      {filtered.length > 0 && (
        <div className="text-right text-xs text-gray-400 mt-4">
          {filtered[0].date}
        </div>
      )}
    </div>
  );
}
