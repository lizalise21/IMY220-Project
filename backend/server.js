import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Stubbed sign-up endpoint. No database yet - just echoes back
// dummy account data so the frontend has something to work with.
app.post("/api/auth/signup", (req, res) => {
  const { username, email } = req.body || {};

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required." });
  }

  return res.status(201).json({
    message: `Account created for ${username}.`,
    user: {
      id: "stub-" + Date.now(),
      username,
      email,
    },
    token: "stub-token-signup",
  });
});

// Stubbed sign-in endpoint. Accepts any credentials and returns a
// dummy user + token. Real authentication comes in a later deliverable.
app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  return res.status(200).json({
    message: "Signed in successfully.",
    user: {
      id: "stub-user-1",
      username: email.split("@")[0],
      email,
    },
    token: "stub-token-signin",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Frame(d) backend listening on port ${PORT}`);
});
