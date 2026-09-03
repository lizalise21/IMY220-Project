import PostPreview from "./PostPreview";

// Lists all posts created by a given user, reusing PostPreview
// rather than duplicating post-rendering markup.
export default function UserPosts({ posts }) {
  return (
    <div>
      <h2 className="section-title">Posts</h2>
      {posts.length ? (
        posts.map((post) => <PostPreview key={post.id} post={post} />)
      ) : (
        <p className="empty-state">This user hasn't posted yet.</p>
      )}
    </div>
  );
}
