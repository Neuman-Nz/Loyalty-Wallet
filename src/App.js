import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import RegisterScreen from "./components/RegisterScreen";
import Login from "./components/login";
import Verify from "./components/verify";

function App() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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
        {/* ✅ Login is now the default */}
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<RegisterScreen />} /> 
        <Route path="/verify" element={<Verify />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </Router>
  );
}

export default App;
