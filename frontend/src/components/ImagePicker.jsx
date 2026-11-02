import { useState } from 'react';
import { fileToDataURL } from '../api';

// File input with drag-and-drop and a preview.
export default function ImagePicker({ id, label, value, onChange, onError, maxMB = 5, round = false }) {
  const [over, setOver] = useState(false);

  const take = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onError('Please choose an image file');
    if (file.size > maxMB * 1024 * 1024) return onError(`Image must be smaller than ${maxMB}MB`);
    onError('');
    onChange(await fileToDataURL(file));
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition ${over ? 'border-accent bg-accent/10' : 'border-ink/25'}`}
      >
        {value && (
          <img
            src={value}
            alt="Preview"
            className={round ? 'mx-auto mb-3 h-28 w-28 rounded-full object-cover' : 'mb-3 max-h-72 w-full rounded-xl object-cover'}
          />
        )}
        <p className="mb-2 text-sm text-ink/70">Drag and drop an image here, or choose a file</p>
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => take(e.target.files[0])}
          className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2 file:font-bold file:text-ink"
        />
      </div>
    </div>
  );
}