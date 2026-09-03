import { useState } from "react";

// Handles entering a search term. Actual search logic isn't implemented
// yet - this just captures state so it's ready to wire up later.
export default function SearchInput({ placeholder = "Search Frame(d)..." }) {
  const [term, setTerm] = useState("");

  return (
    <div className="search-input">
      <span aria-hidden="true">🔍</span>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  );
}
