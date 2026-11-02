import { useId } from 'react';

// Real avatar if set, otherwise a unique generated one (colours and shape come from the username).
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function Avatar({ user, size = 'h-10 w-10' }) {
  const uid = useId().replace(/:/g, '');
  const name = user.username || '?';
  if (user.avatar) {
    return <img src={user.avatar} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  const h = hash(name);
  const hue = h % 360;
  const hue2 = (hue + 40 + ((h >> 3) % 80)) % 360;
  const cx = 10 + ((h >> 5) % 80);
  const cy = 10 + ((h >> 9) % 80);
  const r = 20 + ((h >> 13) % 30);
  const id = `av-${uid}`;
  return (
    <svg viewBox="0 0 100 100" className={`${size} shrink-0 rounded-full`} role="img" aria-label={name}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 65% 60%)`} />
          <stop offset="1" stopColor={`hsl(${hue2} 65% 40%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.18" />
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="44" fontWeight="700" fill="white">
        {name[0].toUpperCase()}
      </text>
    </svg>
  );
}