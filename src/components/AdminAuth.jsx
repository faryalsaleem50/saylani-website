import { useEffect, useState } from 'react';
import { supabase } from '../library/supabaseclient';

export default function AdminAuth({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', user.email)
        .single();
      if (data) setIsAdmin(true);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-2xl">🔄 Checking Admin...</div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-red-200">
        <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
        <p className="text-gray-600 mb-8">Only authorized emails allowed</p>
        <a href="/login" className="w-full block bg-purple-600 text-white py-4 px-8 rounded-2xl font-bold hover:bg-purple-700">
          🔐 Go to Login
        </a>
      </div>
    </div>
  );

  return children;
}
