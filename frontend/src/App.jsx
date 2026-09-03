import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import { currentUser } from "./data/dummyData";

// App is the highest parent - dummy data is loaded here once and
// passed down as props to whichever components need it.
export default function App() {
  const location = useLocation();
  const isSplash = location.pathname === "/";

  return (
    <div className="app-shell">
      {!isSplash && <Header currentUserId={currentUser.id} />}
      <main>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
