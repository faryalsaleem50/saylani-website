import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";

export default function AdminVolunteers({ onRefreshStats }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 FIXED: Real-time + Better Error Handling
  useEffect(() => {
    fetchVolunteers();
    
    // Real-time subscription
    const subscription = supabase
      .channel('volunteers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'volunteers' }, 
        fetchVolunteers
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // 🔥 FIXED: Complete Error Handling + Debug Logs
  const fetchVolunteers = async () => {
    setLoading(true);
    console.log('🔍 Fetching volunteers...');
    
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*, profiles(full_name, email, phone)')
        .order('created_at', { ascending: false });

      console.log('✅ Volunteers DATA:', data);
      console.log('❌ Volunteers ERROR:', error);

      if (error) {
        console.error('🚨 RLS Error:', error.message);
        // Fallback: Try without profiles join
        const { data: fallbackData } = await supabase
          .from('volunteers')
          .select('*')
          .order('created_at', { ascending: false });
        console.log('🔍 Fallback data:', fallbackData);
        setVolunteers(fallbackData || []);
      } else {
        setVolunteers(data || []);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
    }
    setLoading(false);
  };

  // 🔥 FIXED: Better error handling
  const updateVolunteerStatus = async (id, status) => {
    const confirmed = confirm(`Mark volunteer as "${status.toUpperCase()}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        alert(`Update failed: ${error.message}`);
      } else {
        console.log('✅ Status updated');
        fetchVolunteers();
        onRefreshStats(); 
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed!');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'pending': default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'accepted': return '✅ ACCEPTED';
      case 'declined': return '❌ DECLINED';
      case 'pending': return '⏳ PENDING';
      default: return 'UNKNOWN';
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) // 🔥 Added direct email
  );

  return (
    <div className="border-t border-gray-200 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          👥 All Volunteers ({filteredVolunteers.length})
        </h3>
        <input
          type="text"
          placeholder="Search volunteers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-xl text-gray-500">🔄 Loading volunteers...</div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">👥</div>
          <p>No volunteers found</p>
          <p className="text-sm mt-2 text-gray-400">
            {(volunteers.length === 0 && !loading) && 'Fill volunteer form first or check console for errors'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map(volunteer => (
            <div key={volunteer.id} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg text-gray-900">
                  {volunteer.profiles?.full_name || volunteer.email || 'No Name'}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(volunteer.status)}`}>
                  {getStatusLabel(volunteer.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-gray-700">
                  <strong>Email:</strong> {volunteer.profiles?.email || volunteer.email || 'N/A'}
                </p>
                {volunteer.profiles?.phone && (
                  <p className="text-gray-700"><strong>Phone:</strong> {volunteer.profiles.phone}</p>
                )}
                <p className="text-gray-700 line-clamp-2">
                  <strong>Reason:</strong> {volunteer.reason || 'No reason provided'}
                </p>
              </div>
              
              <div className="text-xs text-gray-500 mb-6">
                Applied: {new Date(volunteer.created_at).toLocaleDateString()}
              </div>

              {volunteer.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateVolunteerStatus(volunteer.id, 'accepted')}
                    className="bg-green-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-700 h-12 flex items-center justify-center"
                  >
                    ✅ Accept
                  </button>
                  <button 
                    onClick={() => updateVolunteerStatus(volunteer.id, 'declined')}
                    className="bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 h-12 flex items-center justify-center"
                  >
                    ❌ Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
