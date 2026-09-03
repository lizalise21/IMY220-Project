import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// Part 3 validation target #2: username required, email format,
// password + repeat-password must match, all before submit is enabled.
export default function SignupForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const usernameValid = username.trim().length >= 3;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const formValid = usernameValid && emailValid && passwordValid && passwordsMatch;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!formValid) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      setServerMessage(data.message || "Account created.");
      onSuccess?.(data);
    } catch (err) {
      setServerMessage("Could not reach the server.");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Sign up</h1>

      <div className={`field ${touched && !usernameValid ? "error" : ""}`}>
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {touched && !usernameValid && (
          <span className="error-msg">Username must be at least 3 characters.</span>
        )}
      </div>

      <div className={`field ${touched && !emailValid ? "error" : ""}`}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {touched && !emailValid && (
          <span className="error-msg">Enter a valid email address.</span>
        )}
      </div>

      <div className={`field ${touched && !passwordValid ? "error" : ""}`}>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {touched && !passwordValid && (
          <span className="error-msg">Password must be at least 6 characters.</span>
        )}
      </div>

      <div className={`field ${touched && !passwordsMatch ? "error" : ""}`}>
        <label htmlFor="signup-confirm">Repeat password</label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {touched && !passwordsMatch && (
          <span className="error-msg">Passwords do not match.</span>
        )}
      </div>

      <button type="submit" className="btn" disabled={touched && !formValid}>
        Sign up
      </button>

      {serverMessage && <p className="form-footer-note">{serverMessage}</p>}
    </form>
  );
}
