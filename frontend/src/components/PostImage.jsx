// Displays the image for a post. Kept separate from Post so the image
// can be swapped out (e.g. lazy loading, zoom) without touching Post.
export default function PostImage({ src, alt }) {
  return <img className="post-image" src={src} alt={alt} />;
}
