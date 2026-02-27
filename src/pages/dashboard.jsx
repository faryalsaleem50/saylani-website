import { useState } from "react";
import LostFound from "../components/LostFound";
import Complaints from "../components/Complaints"; 
import Volunteers from "../components/Volunteers";  // ✅ ADDED

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("lost-found");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Saylani Mass IT Hub</h1>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.email?.split("@")[0]}!
          </h2>
          <p className="text-gray-600">
            Campus Portal - Manage Lost & Found, Complaints, Volunteers
          </p>
        </div>

        {/* Tabs - 3 TABS ONLY (Admin Removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => setActiveTab("lost-found")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "lost-found"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md"
            }`}
          >
            📦 Lost & Found
          </button>
          
          <button
            onClick={() => setActiveTab("complaints")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "complaints"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
            }`}
          >
            ⚠️ Complaints
          </button>
          
          {/* ✅ VOLUNTEERS - NOW WORKING */}
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "volunteers"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md"
            }`}
          >
            👥 Volunteers
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {activeTab === "lost-found" && <LostFound />}
          
          {activeTab === "complaints" && <Complaints userId={user.id} />}
          
          {/* ✅ VOLUNTEERS COMPONENT */}
          {activeTab === "volunteers" && <Volunteers userId={user.id} />}
        </div>
      </div>
    </div>
  );
}
