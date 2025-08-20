// import React, { useMemo, useState } from "react";

// const currency = (n) => `$${Number(n).toFixed(2)}`;

// export default function App() {
//   const [balance, setBalance] = useState(4942.0);
//   const [amount, setAmount] = useState("");
//   const [note, setNote] = useState("");
//   const [transactions, setTransactions] = useState([
//     { id: 1, type: "receive", amount: 120.5, note: "Refund", date: new Date().toLocaleString() },
//     { id: 2, type: "send", amount: 45.0, note: "Taxi", date: new Date().toLocaleString() },
//   ]);

//   const spentThisMonth = useMemo(() => {
//     return transactions
//       .filter((t) => t.type === "send")
//       .reduce((sum, t) => sum + t.amount, 0);
//   }, [transactions]);

//   const handleTx = (type) => {
//     const amt = parseFloat(amount);
//     if (isNaN(amt) || amt <= 0) {
//       alert("Enter a valid amount");
//       return;
//     }
//     if (type === "send" && amt > balance) {
//       alert("Insufficient balance");
//       return;
//     }
//     setBalance((b) => (type === "send" ? b - amt : b + amt));
//     setTransactions((list) => [
//       { id: Date.now(), type, amount: amt, note, date: new Date().toLocaleString() },
//       ...list,
//     ]);
//     setAmount("");
//     setNote("");
//   };

//  return (
//   <div className="min-h-screen flex flex-col bg-white">
//     {/* Header */}
//     <header className="p-4 flex items-center justify-between">
//       <div className="text-xl font-bold">Transaction App</div>
//       <button aria-label="expand" className="p-2 rounded-lg hover:bg-gray-100">
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//           <path d="M7 3H3v4M17 3h4v4M21 17v4h-4M3 17v4h4" fill="none" stroke="currentColor" strokeWidth="2" />
//         </svg>
//       </button>
//     </header>

//     {/* Scrollable main content */}
//     <main className="flex-1 overflow-y-auto px-4 pb-24">
//       {/* Card */}
//       <section>
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
//           <div className="flex justify-between items-center">
//             <span className="bg-white/90 text-black px-3 py-1 text-sm rounded-full shadow">
//               Master card ▾
//             </span>
//             <span className="opacity-70 text-sm">Transaction App</span>
//           </div>
//           <div className="mt-6">
//             <p className="text-sm opacity-80">Current Balance</p>
//             <p className="text-4xl font-bold">{currency(balance)}</p>
//           </div>
//           <div className="mt-6 flex justify-between text-sm opacity-80">
//             <p>Exp. 08/26</p>
//             <p>Card 5679••••</p>
//           </div>
//         </div>
//       </section>

//       {/* Budgets */}
//       <section className="mt-8">
//         <h2 className="text-lg font-semibold">Budgets</h2>
//         <div className="space-y-3 mt-3">
//           <BudgetRow label="Transportation" left="$678 left" percent={86} />
//           <BudgetRow label="Groceries" left="$326 left" percent={67} />
//         </div>
//       </section>

//       {/* Transactions */}
//       <section className="mt-6 grid gap-3">
//         <h3 className="text-md font-semibold">Make a Transaction</h3>
//         <div className="flex gap-2">
//           <input
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="Amount"
//             className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <button onClick={() => handleTx('send')} className="px-4 py-2 rounded-xl bg-red-500 text-white shadow">
//             Send
//           </button>
//           <button onClick={() => handleTx('receive')} className="px-4 py-2 rounded-xl bg-green-500 text-white shadow">
//             Receive
//           </button>
//         </div>
//         <input
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           placeholder="Note (optional)"
//           className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <div className="text-sm text-gray-500">Spent this month: {currency(spentThisMonth)}</div>
//       </section>

//       {/* History */}
//       <section className="mt-6">
//         <h3 className="text-md font-semibold mb-2">Transaction History</h3>
//         <ul className="space-y-2">
//           {transactions.map((t) => (
//             <li key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3">
//                 <div className={"w-9 h-9 rounded-full grid place-items-center " + (t.type === "send" ? "bg-red-100" : "bg-green-100")}>
//                   {t.type === "send" ? "−" : "+"}
//                 </div>
//                 <div>
//                   <div className="font-medium">
//                     {t.type === "send" ? "Sent" : "Received"} {currency(t.amount)}
//                   </div>
//                   <div className="text-xs text-gray-500">{t.note || "—"} · {t.date}</div>
//                 </div>
//               </div>
//             </li>
//           ))}
//           {transactions.length === 0 && <p className="text-sm text-gray-400">No transactions yet</p>}
//         </ul>
//       </section>
//     </main>

//     {/* Sticky bottom nav */}
//     <nav className="h-20 bg-white border-t flex items-center justify-around fixed bottom-0 left-0 right-0">
//       <button className="flex flex-col items-center text-gray-500">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 6h18M3 12h18M3 18h18"/></svg>
//         <span className="text-xs">Cards</span>
//       </button>
//       <button className="flex flex-col items-center text-indigo-600">
//         <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white">⌁</div>
//       </button>
//       <button className="flex flex-col items-center text-gray-500">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="2"/><path d="M4 21a8 8 0 0116 0" strokeWidth="2"/></svg>
//         <span className="text-xs">Account</span>
//       </button>
//     </nav>
//   </div>
// );

// }

// function BudgetRow({ label, left, percent }) {
//   return (
//     <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="font-medium">{label}</p>
//           <p className="text-sm text-gray-500">{left}</p>
//         </div>
//         <p className="text-lg font-semibold">{percent}%</p>
//       </div>
//       <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
//         <div
//           className="h-full bg-indigo-600"
//           style={{ width: `${percent}%` }}
//         />
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";   // ✅ keep only this one
import Transactions from "./components/Transactions";

function App() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // detect if screen is mobile-sized
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-gray-700">
          Please use a mobile device to view this app 📱
        </h1>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </Router>
  );
}

export default App;

