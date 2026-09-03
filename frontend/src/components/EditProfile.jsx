import { useState } from "react";

// Form for editing the current user's profile info.
export default function EditProfile({ user, onSave, onCancel }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);

  function handleSubmit(e) {
    e.preventDefault();
    onSave?.({ ...user, displayName, bio });
  }

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={!displayName.trim()}>
          Save changes
        </button>
      </div>
    </form>
  );
}
