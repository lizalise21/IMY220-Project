import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// Part 3 validation target #1: email format + non-empty password,
// submit stays disabled until both pass.
export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!formValid) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setServerMessage(data.message || "Signed in.");
      onSuccess?.(data);
    } catch (err) {
      setServerMessage("Could not reach the server.");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Log in</h1>

      <div className={`field ${touched && !emailValid ? "error" : ""}`}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {touched && !emailValid && (
          <span className="error-msg">Enter a valid email address.</span>
        )}
      </div>

      <div className={`field ${touched && !passwordValid ? "error" : ""}`}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {touched && !passwordValid && (
          <span className="error-msg">Password must be at least 6 characters.</span>
        )}
      </div>

      <button type="submit" className="btn" disabled={touched && !formValid}>
        Log in
      </button>

      {serverMessage && <p className="form-footer-note">{serverMessage}</p>}
    </form>
  );
}
