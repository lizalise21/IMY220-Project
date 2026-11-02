import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Splash from './pages/Splash';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Friends from './pages/Friends';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';

function Shell() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-10 text-center text-ink/70">Loading…</p>;

  // Logged-out visitors can only ever reach the splash page.
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Feed />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={user.role === 'admin' ? <Admin /> : <Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}