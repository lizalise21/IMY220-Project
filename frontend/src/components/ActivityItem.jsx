import { Link } from 'react-router-dom';
import ItemHeader from './ItemHeader';
import PostCard from './PostCard';
import TagList from './TagList';

// One entry in the activity feed: a new post, a new album, or photos added to an album.
export default function ActivityItem({ item }) {
  if (item.type === 'post') return <PostCard post={item.post} />;

  const { album } = item;
  const added = item.type === 'album_add';
  const photos = added ? item.posts.slice(0, 6) : album.posts.slice(0, 3);
  const n = added ? item.posts.length : 0;

  return (
    <article className="space-y-3">
      <ItemHeader user={item.user} date={item.createdAt}>
        {added ? `added ${n} photo${n === 1 ? '' : 's'} to the album ` : 'created the album '}
        <Link to={`/albums/${album._id}`} className="font-bold text-accent hover:underline">{album.name}</Link>
      </ItemHeader>
      {photos.length === 0 ? (
        <p className="text-sm text-ink/60">No photos in this album yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <Link key={p._id} to={`/post/${p._id}`}>
              <img src={p.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
            </Link>
          ))}
        </div>
      )}
      {album.description && <p className="text-sm text-ink/80">{album.description}</p>}
      <TagList tags={album.hashtags} />
    </article>
  );
}