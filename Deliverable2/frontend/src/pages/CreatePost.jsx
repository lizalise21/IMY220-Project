import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fileToDataURL, parseTags } from '../api';

export default function CreatePost() {
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be smaller than 5MB');
    setError('');
    setImage(await fileToDataURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please add an image');
    setBusy(true);
    try {
      await api('/posts', { method: 'POST', body: { image, description, hashtags: parseTags(tags) } });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New post</h1>
      <form onSubmit={submit} className="card space-y-4">
        <input type="file" accept="image/*" onChange={pick} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2 file:font-semibold" />
        {image && <img src={image} alt="preview" className="max-h-80 w-full rounded-xl object-cover" />}
        <textarea className="input" rows={3} placeholder="Write a description…" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="input" placeholder="Hashtags, separated by spaces (e.g. sunset travel)" value={tags} onChange={(e) => setTags(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </form>
    </div>
  );
}