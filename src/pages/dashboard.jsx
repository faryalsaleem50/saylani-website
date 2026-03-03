import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";
import LostFound from "../components/LostFound";
import Complaints from "../components/Complaints"; 
import Volunteers from "../components/Volunteers";
import AdminComplaints from "../components/AdminComplaints";
import AdminVolunteers from "../components/AdminVolunteers"; // 🔥 ADDED

export default function Dashboard({ user, onLogout }) {
  // 🔥 ALL STATES
  const [adminSubTab, setAdminSubTab] = useState("admin-lostfound");
  const [activeTab, setActiveTab] = useState("lost-found");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    pendingLostFound: 0,
    totalLostFound: 0,
    pendingComplaints: 0,
    totalVolunteers: 0,
    totalUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // 🔥 ADMIN ITEMS MANAGER
  const [adminItems, setAdminItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 FIXED: Separate effects
  useEffect(() => {
    if (user?.email) {
      fetchRealStats();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin && activeTab === "admin") {
      fetchAdminItems();
      setAdminSubTab("admin-lostfound"); // Default to lost found
    }
  }, [isAdmin, activeTab]);

  const fetchRealStats = async () => {
    setLoadingStats(true);
    
    // 1. Check Admin FIRST
    const { data: adminCheck } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .single();
    setIsAdmin(!!adminCheck);

    // 🔥 2. FIXED COUNTS - pending + total
    try {
      const [pendingRes, totalRes, complaintsRes, volunteersRes, usersRes] = await Promise.all([
        supabase.from('lost_found_items').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('lost_found_items').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('volunteers').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        pendingLostFound: pendingRes[0]?.count || 0,
        totalLostFound: totalRes[0]?.count || 0,
        pendingComplaints: complaintsRes[0]?.count || 0,
        totalVolunteers: volunteersRes[0]?.count || 0,
        totalUsers: usersRes[0]?.count || 0
      });
    } catch (error) {
      console.log('Stats error:', error);
    }
    
    setLoadingStats(false);
  };

  const fetchAdminItems = async () => {
    setLoadingItems(true);
    try {
      const { data } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      const fixedData = data?.map(item => ({
        ...item,
        displayImage: item.image_url ? 
          `https://hrirvzyfiepivaxwhsvx.supabase.co/storage/v1/object/public/images/${item.image_url}`
          : null
      })) || [];
      
      setAdminItems(fixedData);
    } catch (error) {
      console.log('Items error:', error);
    }
    setLoadingItems(false);
  };

  // 🔥 FIXED: 3 BUTTONS + Better Status Display
  const updateItemStatus = async (id, status) => {
    console.log(`🔥 Button clicked! ID: ${id}, Status: ${status}`);
    
    const statusLabels = {
      'found': 'FOUND ✅',
      'not_found': 'NOT FOUND ❌', 
      'resolved': 'RESOLVED ✔️'
    };
    
    if (!confirm(`Mark this item as "${statusLabels[status]}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lost_found_items')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Updated successfully');
      await Promise.all([fetchAdminItems(), fetchRealStats()]);
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const refreshAllData = async () => {
    await fetchRealStats();
    if (isAdmin && activeTab === "admin") {
      await fetchAdminItems();
    }
  };

  // 🔥 IMPROVED Status Badge Colors
  const getStatusBadge = (status) => {
    switch(status) {
      case 'found':
        return 'bg-green-100 text-green-800';
      case 'not_found':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'found': return '✅ FOUND';
      case 'not_found': return '❌ NOT FOUND';
      case 'resolved': return '✔️ RESOLVED';
      case 'pending': return '⏳ PENDING';
      default: return 'UNKNOWN';
    }
  };

  const filteredItems = adminItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Saylani Mass IT Hub</h1>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={async () => {
                  setActiveTab("admin");
                  await fetchAdminItems();
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                👑 Admin ({stats.totalLostFound})
              </button>
            )}
            <button onClick={onLogout} className="text-red-600 hover:text-red-800 font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.email?.split("@")[0]}!
            {isAdmin && <span className="ml-2 text-purple-600 font-bold text-sm bg-purple-100 px-2 py-1 rounded-full">👑 ADMIN</span>}
          </h2>
          <p className="text-gray-600">
            all activites show here,
          </p>
        </div>

        {/* Main Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => setActiveTab("lost-found")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "lost-found" ? "bg-green-500 text-white shadow-lg" : "bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md"
            }`}
          >
            📦 Lost & Found ({stats.pendingLostFound})
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "complaints" ? "bg-blue-500 text-white shadow-lg" : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
            }`}
          >
            ⚠️ Complaints ({stats.pendingComplaints})
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`p-4 rounded-xl font-medium transition-all ${
              activeTab === "volunteers" ? "bg-purple-500 text-white shadow-lg" : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md"
            }`}
          >
            👥 Volunteers ({stats.totalVolunteers})
          </button>
        </div>

        {/* 🔥 COMPLETE ADMIN PANEL WITH 3 TABS */}
        {activeTab === "admin" && isAdmin && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-8">
            {/* Admin Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">👑 Admin Control Panel</h2>
                <p className="text-gray-600">Manage campus activities</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={refreshAllData}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2"
                  disabled={loadingStats || loadingItems}
                >
                  🔄 Refresh {loadingItems && 'Items...'}
                </button>
                <button
                  onClick={() => setActiveTab("lost-found")}
                  className="bg-gray-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-700"
                >
                  ← Back
                </button>
              </div>
            </div>

             {/* 🔥 Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="bg-orange-400 p-6 rounded-2xl text-white text-center">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-3xl font-bold">{stats.totalLostFound}</p>
        <p className="text-orange-100 font-semibold">Total Lost/Found</p>
        <p className="text-sm opacity-90">({stats.pendingLostFound} pending)</p>
      </div>
      <div className="bg-red-400 p-6 rounded-2xl text-white text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-3xl font-bold">{stats.pendingComplaints}</p>
        <p className="text-red-100 font-semibold">Pending Complaints</p>
      </div>
      <div className="bg-blue-400 p-6 rounded-2xl border border-gray-200 text-center">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-3xl font-bold text-gray-900">{stats.totalVolunteers}</p>
        <p className="text-white font-semibold">Total Volunteers</p>
      </div>
     
    </div>

    {/* 🔥 ADMIN SUB-TABS - 3 TABS */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-100 p-2 rounded-2xl mb-8">
      <button
        onClick={() => setAdminSubTab("admin-lostfound")}
        className={`py-3 px-6 font-bold rounded-xl transition-all ${
          adminSubTab === "admin-lostfound" 
            ? "bg-white shadow-lg text-gray-800" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        📦 Lost & Found ({stats.pendingLostFound})
      </button>
      <button
        onClick={() => setAdminSubTab("admin-complaints")}
        className={`py-3 px-6 font-bold rounded-xl transition-all ${
          adminSubTab === "admin-complaints" 
            ? "bg-white shadow-lg text-gray-800" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        ⚠️ Complaints ({stats.pendingComplaints})
      </button>
      <button
        onClick={() => setAdminSubTab("admin-volunteers")}
        className={`py-3 px-6 font-bold rounded-xl transition-all ${
          adminSubTab === "admin-volunteers" 
            ? "bg-white shadow-lg text-gray-800" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        👥 Volunteers ({stats.totalVolunteers})
      </button>
    </div>
{/* 🔥 LOST & FOUND SECTION */}
    {adminSubTab === "admin-lostfound" && (
      <div className="border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            📦 All Lost & Found Items ({filteredItems.length}/{stats.totalLostFound})
          </h3>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl text-gray-500">🔄 Loading items...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            {searchTerm ? 'No matching items' : 'No items found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>
                
                {item.displayImage && (
                  <img 
                    src={item.displayImage} 
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-xl mb-4 shadow-md"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                  />
                )}
                
                <div className="flex gap-2 mb-6 text-xs text-gray-500">
                  <span>{item.category?.toUpperCase()}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                
                {item.status === 'pending' && (
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => updateItemStatus(item.id, 'found')}
                      className="bg-green-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-700 h-12 flex items-center justify-center"
                    >
                      ✅ Mark Found
                    </button>
                    <button
                      onClick={() => updateItemStatus(item.id, 'not_found')}
                      className="bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 h-12 flex items-center justify-center"
                    >
                      ❌ Mark Not Found
                    </button>
                    <button
                      onClick={() => updateItemStatus(item.id, 'resolved')}
                      className="bg-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-purple-700 h-12 flex items-center justify-center"
                    >
                      ✔️ Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}


            {/* 🔥 COMPLAINTS SECTION */}
            {adminSubTab === "admin-complaints" && (
              <AdminComplaints onRefreshStats={fetchRealStats} />
            )}

            
    {/* 🔥 VOLUNTEERS SECTION - NEW! */}
    {adminSubTab === "admin-volunteers" && (
      <AdminVolunteers onRefreshStats={fetchRealStats} />
    )}
          </div>
        )}

        {/* Normal User Content */}
        {activeTab !== "admin" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {activeTab === "lost-found" && <LostFound />}
            {activeTab === "complaints" && <Complaints userId={user.id} />}
            {activeTab === "volunteers" && <Volunteers userId={user.id} />}
          </div>
        )}
      </div>
    </div>
  );
}
