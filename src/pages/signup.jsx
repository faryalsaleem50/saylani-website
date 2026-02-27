import { useState } from "react";
import { supabase } from "../library/supabaseclient";
import AuthForm from "../components/Authform";

export default function Signup({ onHaveAccountClick, onSignupSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSignup = async ({ email, password }) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    alert("Signup successful!");
    onSignupSuccess();
  };

  return (
    <AuthForm
      title="Create an account"
      submitLabel="Sign up"
      onSubmit={handleSignup}
      onSwitch={onHaveAccountClick}
      switchText="Already have an account?"
      switchLinkText="Log in"
    />
  );
}
