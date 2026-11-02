import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ItemHeader from './ItemHeader';
import TagList from './TagList';

// A post as shown in feeds and search results. Posts reported more than twice are hidden.
export default function PostCard({ post: initial }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initial);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState('');

  const liked = post.likes.includes(user._id);
  const hidden = post.reportCount > 2 && !reveal;
  const more = post.commentCount - post.comments.length;

  const like = async () => {
    try {
      const r = await api(`/posts/${post._id}/like`, { method: 'POST' });
      setPost({ ...post, likes: r.likes });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <article className="space-y-3">
      <ItemHeader user={post.author} date={post.createdAt}>shared a photo</ItemHeader>

      {hidden ? (
        <div className="space-y-3 rounded-2xl border border-ink/20 p-6 text-center">
          <p className="font-bold">This post has been reported and is hidden.</p>
          <button type="button" className="btn-ghost" onClick={() => setReveal(true)}>View anyway</button>
        </div>
      ) : (
        <>
          <Link to={`/post/${post._id}`} className="frame block">
            <img src={post.image} alt={post.description} className="max-h-[32rem] w-full rounded-sm object-cover" />
          </Link>
          <p>
            <Link to={`/profile/${post.author._id}`} className="font-bold hover:text-accent">{post.author.username}</Link>{' '}
            {post.description}
          </p>
          <TagList tags={post.hashtags} />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" className={liked ? 'btn' : 'btn-ghost'} onClick={like} aria-pressed={liked}>
              ♥ {post.likes.length} likes
            </button>
            <Link to={`/post/${post._id}`} className="link">{post.commentCount} comments</Link>
          </div>
          {post.comments.map((c) => (
            <p key={c._id} className="text-sm">
              <span className="font-bold">{c.author.username}</span> {c.text}
            </p>
          ))}
          {more > 0 && (
            <Link to={`/post/${post._id}`} className="link text-sm">View all {post.commentCount} comments</Link>
          )}
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        </>
      )}
    </article>
  );
}