import { Link } from 'react-router-dom';

export default function AlbumCard({ album }) {
  const imgs = album.posts.slice(0, 4);
  const count = album.posts.length;
  return (
    <Link to={`/albums/${album._id}`} className="group block space-y-2">
      <div className={`grid aspect-[4/3] gap-1 overflow-hidden rounded-2xl bg-sand ring-1 ring-ink/10 transition group-hover:ring-accent ${imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {imgs.length === 0 && <p className="col-span-2 flex items-center justify-center text-sm text-ink/60">No photos yet</p>}
        {imgs.map((p) => <img key={p._id} src={p.image} alt="" className="h-full w-full object-cover" />)}
      </div>
      <h3 className="font-bold group-hover:text-accent">{album.name}</h3>
      <p className="text-sm text-ink/70">
        {album.owner?.username ? `by ${album.owner.username} · ` : ''}{count} photo{count === 1 ? '' : 's'}
      </p>
    </Link>
  );
}