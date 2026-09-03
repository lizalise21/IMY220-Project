import PostPreview from "./PostPreview";

// Displays a list of PostPreview components. One component handles both
// the "Following" and "Discover" feeds - which posts to show is decided
// by whatever array is passed in as "posts".
export default function Feed({ posts }) {
  if (!posts.length) {
    return <p className="empty-state">No posts here yet.</p>;
  }

  return (
    <div className="feed">
      {posts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </div>
  );
}
