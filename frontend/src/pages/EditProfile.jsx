import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Field from '../components/Field';
import ImagePicker from '../components/ImagePicker';
import { useConfirm } from '../components/ConfirmModal';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user.username,
    name: user.name || '',
    pronouns: user.pronouns || '',
    bio: user.bio || '',
    links: (user.links || []).join('\n'),
  });
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [error, setError] = useState('');
  const [modal, ask] = useConfirm();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.username.trim().length < 3) return setError('Username must be at least 3 characters');
    try {
      const updated = await api('/users/me', {
        method: 'PUT',
        body: { ...form, username: form.username.trim(), links: form.links.split(/\s+/).filter(Boolean), avatar },
      });
      setUser(updated);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const askDelete = () => ask({
    title: 'Delete your account?',
    message: 'Your account, posts, albums and comments will be permanently deleted. This cannot be undone.',
    confirmLabel: 'Delete my account',
    onConfirm: async () => {
      try {
        await api('/users/me', { method: 'DELETE' });
        setUser(null);
      } catch (err) {
        setError(err.message);
      }
    },
  });

  return (
    <div className="space-y-8">
      {modal}
      <h1 className="text-3xl font-bold">Edit profile</h1>
      <form onSubmit={submit} className="card space-y-4" noValidate>
        <ImagePicker id="avatar" label="Profile picture" value={avatar} onChange={setAvatar} onError={setError} maxMB={2} round />
        {avatar && <button type="button" className="btn-ghost" onClick={() => setAvatar('')}>Remove picture</button>}
        <Field id="ep-username" label="Username" value={form.username} onChange={set('username')} />
        <Field id="ep-name" label="Name" value={form.name} onChange={set('name')} />
        <Field id="ep-pronouns" label="Pronouns" value={form.pronouns} onChange={set('pronouns')} placeholder="e.g. she/her" />
        <Field id="ep-bio" label="Bio" as="textarea" rows={4} value={form.bio} onChange={set('bio')} placeholder="Tell people about yourself…" />
        <Field id="ep-links" label="Social links" as="textarea" rows={3} value={form.links} onChange={set('links')} hint="One link per line, starting with https://" />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="btn">Save changes</button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
      </form>
      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Delete account</h2>
        <p className="text-sm text-ink/70">Permanently removes your account and everything you posted.</p>
        <button type="button" className="btn-danger" onClick={askDelete}>Delete my account</button>
      </section>
    </div>
  );
}