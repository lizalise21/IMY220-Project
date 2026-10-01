import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fileToDataURL } from '../api';
import { useAuth } from '../AuthContext';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError('Avatar must be smaller than 2MB');
    setError('');
    setAvatar(await fileToDataURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return setError('Username cannot be empty');
    try {
      const updated = await api('/users/me', { method: 'PUT', body: { username: username.trim(), bio, avatar } });
      setUser(updated);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Edit profile</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-sand text-3xl font-bold">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : username[0]?.toUpperCase()}
          </div>
          <input type="file" accept="image/*" onChange={pick} className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2 file:font-semibold" />
        </div>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <textarea className="input" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself…" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn">Save changes</button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}