import { useState, useEffect } from "react";
import { supabase } from "./library/supabaseclient";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";



export default function App() {
  const [page, setPage] = useState("login"); // "login", "signup", "dashboard"
  const [user, setUser] = useState(null);

  // agar user already logged in hai to direct dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setPage("dashboard");
      }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {page === "signup" && (
        <Signup
          onHaveAccountClick={() => setPage("login")}
          onSignupSuccess={() => setPage("dashboard")}
        />
      )}

      {page === "login" && (
        <Login
          onDontHaveAccountClick={() => setPage("signup")}
          onLoginSuccess={() => setPage("dashboard")}
        />
      )}

      {page === "dashboard" && (
        <Dashboard
          user={user}
          onLogout={() => {
            supabase.auth.signOut();
            setUser(null);
            setPage("login");
          }}
        />
      )}
    </div>
  );
}
