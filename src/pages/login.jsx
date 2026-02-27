import { useState } from "react";
import { supabase } from "../library/supabaseclient";
import AuthForm from "../components/Authform";

export default function Login({ onDontHaveAccountClick, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    onLoginSuccess();
  };

  return (
    <AuthForm
      title="Welcome back"
      submitLabel="Log in"
      onSubmit={handleLogin}
      onSwitch={onDontHaveAccountClick}
      switchText="Don’t have an account?"
      switchLinkText="Sign up"
    />
  );
}
