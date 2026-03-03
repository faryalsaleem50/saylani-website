// src/components/AdminPanel.jsx
import { useState } from "react";
import AdminLostFound from "./AdminLostFound"; // Aapka existing lost found logic
import AdminComplaints from "./AdminComplaints";

export default function AdminPanel({ stats, fetchRealStats, loadingStats }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">👑 Admin Control Panel</h2>
          <p className="text-gray-600">Manage campus activities</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchRealStats}
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2"
            disabled={loadingStats}
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-700"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-orange-400 p-6 rounded-2xl text-white text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-3xl font-bold">{stats.totalLostFound || 0}</p>
          <p className="text-orange-100 font-semibold">Total Lost/Found</p>
          <p className="text-sm opacity-90">({stats.pendingLostFound || 0} pending)</p>
        </div>
        <div className="bg-red-400 p-6 rounded-2xl text-white text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-3xl font-bold">{stats.pendingComplaints || 0}</p>
          <p className="text-red-100 font-semibold">Pending Complaints</p>
        </div>
        <div className="bg-blue-400 p-6 rounded-2xl border border-gray-200 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalVolunteers || 0}</p>
          <p className="text-white font-semibold">Total Volunteers</p>
        </div>
      </div>

      {/* 🔥 SECTIONS */}
      <AdminLostFound onRefreshStats={fetchRealStats} />
      <AdminComplaints onRefreshStats={fetchRealStats} />
    </div>
  );
}
