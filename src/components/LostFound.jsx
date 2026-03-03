import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";

export default function LostFound() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lost'); // Added category state
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id);
      fetchItems();
    };
    init();
  }, []);

  // **SUPABASE RLS automic rls krlegA
  const fetchItems = async () => {
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
    
    setItems(fixedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imagePath = '';

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, file);
      
      if (!error) {
        imagePath = fileName;
      }
    }

    if (editingId) {
      // **RLS WILL CHECK IF USER OWNS THIS ITEM**
      const { error } = await supabase
        .from('lost_found_items')
        .update({ 
          title, 
          description, 
          category, // Added category to update
          image_url: imagePath || items.find(item => item.id === editingId)?.image_url 
        })
        .eq('id', editingId);
      
      if (error) {
        alert('Edit permission denied!');
        setLoading(false);
        return;
      }
      setEditingId(null);
    } else {
      // **RLS WILL CHECK USER_ID MATCHES**
      const { error } = await supabase.from('lost_found_items').insert({
        title, description, category, image_url: imagePath, // Added category
        status: 'pending', user_id: userId
      });
      
      if (error) {
        alert('Post failed!');
        setLoading(false);
        return;
      }
    }

    setTitle(''); setDescription(''); setCategory('lost'); setFile(null); // Reset category
    fetchItems();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      // **RLS WILL BLOCK IF NOT OWNER**
      const { error } = await supabase
        .from('lost_found_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Delete permission denied!');
        return;
      }
      fetchItems();
    }
  };

  // **FRONTEND CHECK - HIDE BUTTONS FOR NON-OWNERS (EXTRA SECURITY)**
  const isOwner = (item) => userId && item.user_id === userId;

  return (
    <div className="space-y-6">
      {/* FORM - SAME AS BEFORE */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-green-600 mb-6">
          {editingId ? '✏️ Edit Item' : '📦 Post Lost/Found Item'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SAME FORM FIELDS */}
          <div>
            <input type="text" placeholder="Item Title" value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
          </div>
          
          {/* NEW CATEGORY DROPDOWN */}
          <div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
              <option value="lost">🔍 Lost Item</option>
              <option value="found">✅ Found Item</option>
            </select>
          </div>
          
          <div>
            <textarea placeholder="Description" value={description} 
              onChange={(e) => setDescription(e.target.value)} rows="4"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
          </div>
          
          <div>
            <input type="file" accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600" />
          </div>
          
          <div className="space-y-3 mt-6">
            <button type="submit" disabled={loading} 
              className="w-full bg-green-800 hover:bg-green-700 text-black py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              {loading ? 'Saving...' : editingId ? 'Update Item' : 'Post Item'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {
                setEditingId(null); setTitle(''); setDescription(''); setCategory('lost'); setFile(null);
              }} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST - ALL ITEMS + OWNER CHECK */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-green-600 mb-6">
          All Lost/Found Items ({items.length})
        </h3>
        
        {items.length === 0 ? (
         <p className="text-center text-gray-500 py-12 text-xl">No items yet!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-2xl p-6 hover:shadow-2xl transition-all">
                <div className="flex justify-between mb-4">
                  <h4 className="text-xl font-bold">{item.title}</h4>
                  {/* **ONLY OWNER SEES BUTTONS** */}
                  {isOwner(item) ? (
                    <div className="space-x-2">
                      <button onClick={() => {
                        setTitle(item.title);
                        setDescription(item.description);
                        setCategory(item.category || 'lost'); // Load category for edit
                        setEditingId(item.id);
                      }} className="text-blue-600 text-2xl hover:scale-110" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 text-2xl hover:scale-110" title="Delete">🗑️</button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">👁️ View only</span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">{item.description}</p>
                
                {item.image_url && item.displayImage && (
                  <div className="mb-6">
                    <img src={item.displayImage} alt={item.title} 
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/66b032/ffffff?text=No+Image'} />
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    item.status === 'found' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {item.status?.toUpperCase()}
                  </span>
                  {/* Show category badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.category === 'found' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    {item.category?.toUpperCase()}
                  </span>
                  <span className="text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
