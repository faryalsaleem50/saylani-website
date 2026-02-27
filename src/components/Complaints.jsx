// components/Complaints.jsx - Updated with Campus Dropdown
import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";

export default function Complaints({ userId }) {
  const [category, setCategory] = useState('internet');
  const [campus, setCampus] = useState('aliabad');  // ← NEW
  const [description, setDescription] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categories = ['internet', 'electricity', 'water', 'maintenance', 'other'];
  const campuses = ['aliabad', 'gulshan', 'bahadrabad', 'paposh', 'shah-faisal'];  // ← NEW

  // **UPDATED: Campus bhi save hoga**
  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  useEffect(() => {
    if (userId) fetchComplaints();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from('complaints')
        .update({ category, campus, description })  // ← campus added
        .eq('id', editingId);
      
      if (error) {
        alert('Edit failed!');
        setLoading(false);
        return;
      }
      setEditingId(null);
    } else {
      const { error } = await supabase.from('complaints').insert({
        category, campus, description, user_id: userId  // ← campus added
      });
      
      if (error) {
        alert('Complaint failed!');
        setLoading(false);
        return;
      }
    }

    setDescription('');
    setCategory('internet');
    setCampus('aliabad');
    fetchComplaints();
    setLoading(false);
  };

  const handleEdit = (complaint) => {
    setCategory(complaint.category);
    setCampus(complaint.campus || 'aliabad');  // ← campus load
    setDescription(complaint.description);
    setEditingId(complaint.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this complaint?')) {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id);
      
      if (!error) fetchComplaints();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'bg-green-200 text-green-800';
      case 'in_progress': return 'bg-blue-200 text-blue-800';
      default: return 'bg-yellow-200 text-yellow-800';
    }
  };

  const getCampusBadge = (campusName) => {
    const campusNames = {
      'aliabad': 'AliAbad',
      'gulshan': 'Gulshan',
      'bahadrabad': 'Bahadrabad', 
      'paposh': 'Paposh',
      'shah-faisal': 'Shah Faisal'
    };
    return campusNames[campusName] || campusName;
  };

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-blue-600 mb-6">
          {editingId ? '✏️ Edit Complaint' : '⚠️ Submit Complaint'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CAMPUS DROPDOWN ← NEW */}
          <div>
            <select 
              value={campus} 
              onChange={(e) => setCampus(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select Campus</option>
              {campuses.map(campusItem => (
                <option key={campusItem} value={campusItem}>
                  {getCampusBadge(campusItem).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Describe your issue..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="space-y-3 mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : editingId ? 'Update Complaint' : 'Submit Complaint'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDescription('');
                  setCategory('internet');
                  setCampus('aliabad');
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-blue-600 mb-6">
          Your Complaints ({complaints.length})
        </h3>
        
        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-xl">No complaints yet! Submit above 👆</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="border rounded-2xl p-6 hover:shadow-2xl transition-all">
                <div className="flex justify-between mb-4">
                  <h4 className="text-xl font-bold capitalize">{complaint.category}</h4>
                  <div className="space-x-2">
                    <button onClick={() => handleEdit(complaint)} 
                      className="text-blue-600 text-2xl hover:scale-110" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(complaint.id)} 
                      className="text-red-600 text-2xl hover:scale-110" title="Delete">🗑️</button>
                  </div>
                </div>
                
                {/* CAMPUS BADGE ← NEW */}
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    📍 {getCampusBadge(complaint.campus)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-6">{complaint.description}</p>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className={`px-4 py-2 rounded-full font-bold ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
