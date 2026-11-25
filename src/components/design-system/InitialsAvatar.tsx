export default function InitialsAvatar({
  name = 'Unassigned',
  size = '20',
  color = '#475569',
}: {
  name?: string;
  size?: string;
  round?: boolean;
  color?: string;
}) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      title={name}
      aria-label={name}
      className="inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{
        width: Number(size),
        height: Number(size),
        backgroundColor: color,
        fontSize: Math.max(10, Number(size) * 0.4),
      }}
    >
      {initials}
    </span>
  );
}
