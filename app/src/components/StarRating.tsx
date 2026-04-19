import { useState } from 'react';
import { Icon } from './Icon';

export function StarRating({
  value = 4.5,
  size = 16,
  interactive = false,
  onChange,
}: { value?: number; size?: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <span className="inline-flex gap-0.5 text-accent">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(null)}
          onClick={() => interactive && onChange?.(i)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          style={{ background: 'transparent', border: 0, padding: 0, color: 'inherit' }}
          aria-label={`${i} star${i === 1 ? '' : 's'}`}
        >
          <Icon name={i <= Math.round(shown) ? 'star-fill' : 'star'} size={size} stroke={1.5} />
        </button>
      ))}
    </span>
  );
}
