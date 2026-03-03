// src/components/AdminComplaints.jsx
import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";

export default function AdminComplaints({ onRefreshStats }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      setComplaints(data || []);
    } catch (error) {
      console.log('Complaints error:', error);
    }
    setLoading(false);
  };

  const updateComplaintStatus = async (id, status) => {
    const confirmed = confirm(`Mark as "${status.toUpperCase()}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);

      if (!error) {
        fetchComplaints();
        onRefreshStats();
      }
    } catch (error) {
      alert('Update failed!');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'solved': return 'bg-green-100 text-green-800';
      case 'not_solved': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'solved': return '✅ SOLVED';
      case 'not_solved': return '❌ NOT SOLVED';
      case 'submitted': return '⏳ PENDING';
      default: return 'UNKNOWN';
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            ⚠️ All Complaints ({filteredComplaints.length})
          </h3>
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-xl text-gray-500">🔄 Loading...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">⚠️</div>
            No complaints found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map(complaint => (
              <div key={complaint.id} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-gray-900">{complaint.title || 'Untitled'}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(complaint.status)}`}>
                    {getStatusLabel(complaint.status)}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{complaint.description}</p>
                <div className="text-xs text-gray-500 mb-6">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </div>
                {complaint.status === 'submitted' && (
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => updateComplaintStatus(complaint.id, 'solved')}
                      className="bg-green-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-700 h-12 flex items-center justify-center"
                    >
                      ✅ Mark Solved
                    </button>
                    <button 
                      onClick={() => updateComplaintStatus(complaint.id, 'not_solved')}
                      className="bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 h-12 flex items-center justify-center"
                    >
                      ❌ Mark Not Solved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
