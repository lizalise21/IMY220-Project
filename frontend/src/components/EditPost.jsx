import { useState } from "react";

// Form for editing an existing post's caption.
export default function EditPost({ post, onSave, onCancel }) {
  const [caption, setCaption] = useState(post.caption);

  function handleSubmit(e) {
    e.preventDefault();
    onSave?.({ ...post, caption });
  }

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="editCaption">Caption</label>
        <textarea
          id="editCaption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      <div className="actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={!caption.trim()}>
          Save changes
        </button>
      </div>
    </form>
  );
}
