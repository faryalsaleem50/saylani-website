import { useState, useEffect } from "react";
import { supabase } from "./library/supabaseclient";
import Auth from "./components/Authform";  // Login/Signup page
import Dashboard from "./pages/dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔥 SHOW LOGIN FIRST - No Access Denied!
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // No user = Show Login page
  if (!session) {
    return <Auth />;
  }

  // User logged in = Show Dashboard
  return <Dashboard user={session.user} onLogout={handleLogout} />;
}

const handleLogout = async () => {
  await supabase.auth.signOut();
};
