import { useState } from "react";
import SearchInput from "../components/SearchInput";
import Feed from "../components/Feed";
import CreatePost from "../components/CreatePost";
import { dummyPosts, currentUser } from "../data/dummyData";

export default function Home() {
  const [tab, setTab] = useState("following");
  const [posts, setPosts] = useState(dummyPosts);

  function handleCreate({ caption, imageUrl }) {
    const newPost = {
      id: String(Date.now()),
      author: currentUser,
      image: imageUrl || "https://picsum.photos/600/600",
      caption,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  }

  return (
    <div className="page">
      <SearchInput placeholder="Search people or posts..." />
      <CreatePost onCreate={handleCreate} />

      <div className="feed-tabs">
        <button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
          Following
        </button>
        <button className={tab === "discover" ? "active" : ""} onClick={() => setTab("discover")}>
          Discover
        </button>
      </div>

      <Feed posts={posts} />
    </div>
  );
}
