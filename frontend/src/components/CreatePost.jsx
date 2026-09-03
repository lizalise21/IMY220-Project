import { useState } from "react";

// Form for creating a post. Not part of Part 3's validation pair (see
// LoginForm/SignupForm), but still disables submit until a caption exists.
export default function CreatePost({ onCreate }) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!caption.trim()) return;
    onCreate?.({ caption, imageUrl });
    setCaption("");
    setImageUrl("");
  }

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="caption">Caption</label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Say something about this photo..."
        />
      </div>
      <div className="field">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="actions">
        <button type="submit" className="btn" disabled={!caption.trim()}>
          Post
        </button>
      </div>
    </form>
  );
}
