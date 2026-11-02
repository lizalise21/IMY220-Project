import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, parseTags } from '../api';
import Field from '../components/Field';
import ImagePicker from '../components/ImagePicker';

export default function CreatePost() {
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please add an image');
    if (!description.trim()) return setError('Please write a description');
    if (!parseTags(tags).length) return setError('Add at least one hashtag');
    setBusy(true);
    try {
      await api('/posts', { method: 'POST', body: { image, description, hashtags: parseTags(tags) } });
      navigate('/home');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New post</h1>
      <form onSubmit={submit} className="card space-y-4" noValidate>
        <ImagePicker id="post-image" label="Photo" value={image} onChange={setImage} onError={setError} />
        <Field id="post-desc" label="Description" as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Say something about this photo…" />
        <Field id="post-tags" label="Hashtags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sunset travel" hint="Separate hashtags with spaces." />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </form>
    </div>
  );
}