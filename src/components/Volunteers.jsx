// Volunteers.jsx
import { useState, useEffect } from "react";
import { supabase } from "../library/supabaseclient";

export default function Volunteers({ userId }) {
  const [timeSlot, setTimeSlot] = useState('1');
  const [rollNo, setRollNo] = useState('');
  const [event, setEvent] = useState('tech-fest');
  const [idCardFile, setIdCardFile] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const timeSlots = ['1', '2', '3', '4', '5', '6'];
  const events = ['tech-fest', 'femhack', 'seminar', 'workshop', 'coding night'];

  useEffect(() => {
    if (userId) fetchVolunteers();
  }, [userId]);

  const fetchVolunteers = async () => {
    const { data } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setVolunteers(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let idCardPath = '';
    if (idCardFile) {
      const fileName = `${Date.now()}-${idCardFile.name}`;
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, idCardFile);
      
      if (!error) idCardPath = fileName;
    }

    if (editingId) {
      const { error } = await supabase
        .from('volunteers')
        .update({ time_slot: timeSlot, roll_no: rollNo, event, id_card_image: idCardPath })
        .eq('id', editingId);
      
      if (error) {
        alert('Edit failed!');
        setLoading(false);
        return;
      }
      setEditingId(null);
    } else {
      const { error } = await supabase.from('volunteers').insert({
        time_slot: timeSlot, roll_no: rollNo, event, id_card_image: idCardPath, user_id: userId
      });
      
      if (error) {
        alert('Registration failed!');
        setLoading(false);
        return;
      }
    }

    setRollNo(''); setTimeSlot('1'); setEvent('tech-fest'); setIdCardFile(null);
    fetchVolunteers();
    setLoading(false);
  };

  const handleEdit = (volunteer) => {
    setTimeSlot(volunteer.time_slot);
    setRollNo(volunteer.roll_no);
    setEvent(volunteer.event);
    setEditingId(volunteer.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this registration?')) {
      await supabase.from('volunteers').delete().eq('id', id);
      fetchVolunteers();
    }
  };

  const downloadIDCard = async (volunteer) => {
    // Simple text-based PDF data
    const idCardData = `
SAYLANI MASS IT HUB - VOLUNTEER ID CARD

Name: ${volunteer.roll_no}
Event: ${events.find(e => e === volunteer.event)?.replace('-', ' ').toUpperCase() || volunteer.event}
Time Slot: ${volunteer.time_slot}
Status: REGISTERED
Date: ${new Date().toLocaleDateString()}

Thank you for volunteering!
    `.trim();

    // Create downloadable text file (PDF )
    const blob = new Blob([idCardData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Volunteer-ID-${volunteer.roll_no}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventName = (eventKey) => {
    const eventNames = {
      'tech-fest': 'Tech Fest',
      'sports-day': 'Sports Day', 
      'seminar': 'Seminar',
      'workshop': 'Workshop',
      'cultural-night': 'Cultural Night'
    };
    return eventNames[eventKey] || eventKey;
  };

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-purple-600 mb-6">
          {editingId ? '✏️ Edit Registration' : '👥 Volunteer Registration'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
          {/* TIME SLOT */}
          <div>
            <select 
              value={timeSlot} 
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>Slot {slot}</option>
              ))}
            </select>
          </div>

          {/* EVENT */}
          <div>
            <select 
              value={event} 
              onChange={(e) => setEvent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {events.map(evt => (
                <option key={evt} value={evt}>{getEventName(evt)}</option>
              ))}
            </select>
          </div>

          {/* ROLL NO */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Your Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* ID CARD UPLOAD */}
          <div className="md:col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : editingId ? 'Update Registration' : 'Register Now'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setRollNo(''); setTimeSlot('1'); setEvent('tech-fest'); setIdCardFile(null);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-purple-600 mb-6">
          Your Registrations ({volunteers.length})
        </h3>
        
        {volunteers.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-xl">No registrations yet! Sign up above 👆</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteers.map((volunteer) => (
              <div key={volunteer.id} className="border rounded-2xl p-6 hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold">{getEventName(volunteer.event)}</h4>
                    <p className="text-gray-600">Roll No: {volunteer.roll_no}</p>
                  </div>
                  <div className="space-x-2 flex flex-col sm:flex-row">
                    <button 
                      onClick={() => downloadIDCard(volunteer)}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600"
                    >
                      📥 Download ID
                    </button>
                    <button onClick={() => handleEdit(volunteer)} 
                      className="text-blue-600 text-xl hover:scale-110 mt-1 sm:mt-0" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(volunteer.id)} 
                      className="text-red-600 text-xl hover:scale-110 mt-1 sm:mt-0" title="Delete">🗑️</button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Slot {volunteer.time_slot}
                  </span>
                  {volunteer.id_card_image && (
                    <div className="mt-2">
                      <img 
                        src={`https://hrirvzyfiepivaxwhsvx.supabase.co/storage/v1/object/public/images/${volunteer.id_card_image}`}
                        alt="ID Card"
                        className="w-24 h-24 object-cover rounded-xl border-2 border-purple-200"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                    REGISTERED
                  </span>
                  <span className="text-gray-500">
                    {new Date(volunteer.created_at).toLocaleDateString()}
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
