import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

// The only page without the Header/Navigation component.
export default function Splash() {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  function handleAuthSuccess() {
    navigate("/home");
  }

  return (
    <div className="splash">
      <h1 className="brand-mark">
        Frame<span>(</span>d<span>)</span>
      </h1>
      <p className="tagline">Share the moment. Keep the frame.</p>

      <div className="splash-tabs">
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          className={mode === "signup" ? "active" : ""}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
      </div>

      {mode === "login" ? (
        <LoginForm onSuccess={handleAuthSuccess} />
      ) : (
        <SignupForm onSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}
