import { Link } from "react-router-dom";

// Encapsulates a single post. Reused in the feed and on profile pages,
// so it takes a "post" object and renders itself the same way everywhere.
export default function PostPreview({ post }) {
  return (
    <article className="post-preview">
      <div className="post-head">
        <Link to={`/profile/${post.author.id}`}>
          <img className="avatar" src={post.author.avatar} alt={post.author.displayName} />
        </Link>
        <div className="username-line">
          <span className="name">{post.author.displayName}</span>
          <span className="handle">@{post.author.username}</span>
        </div>
      </div>

      <Link to={`/post/${post.id}`}>
        <img className="post-image" src={post.image} alt={post.caption} />
      </Link>

      <div className="post-body">
        <p>{post.caption}</p>
        <div className="post-meta">
          <span>♥ {post.likes} likes</span>
          <span>💬 {post.comments.length} comments</span>
        </div>
      </div>
    </article>
  );
}
