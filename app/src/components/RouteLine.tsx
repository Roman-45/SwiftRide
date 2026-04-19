import type { Place } from '../types';

interface RouteLineProps {
  pickup: Place;
  dropoff: Place;
  compact?: boolean;
}

// A vertical connector showing pickup → dropoff with a coloured dot for each,
// used by booking, active-trip, receipt, and the driver queue.
export function RouteLine({ pickup, dropoff, compact }: RouteLineProps) {
  const gap = compact ? 'gap-1' : 'gap-4';
  return (
    <div className="grid grid-cols-[14px_1fr] gap-3">
      <div className="flex flex-col items-center gap-1 pt-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-ink" />
        <span className="flex-1 w-px bg-line min-h-[16px]" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
      </div>
      <div className={`grid ${gap}`}>
        <div>
          {!compact && <div className="sr-micro">Pickup</div>}
          <div className="text-[14px] font-medium">{pickup.label}</div>
          {pickup.sub && <div className="sr-small">{pickup.sub}</div>}
        </div>
        <div>
          {!compact && <div className="sr-micro">Dropoff</div>}
          <div className="text-[14px] font-medium">{dropoff.label}</div>
          {dropoff.sub && <div className="sr-small">{dropoff.sub}</div>}
        </div>
      </div>
    </div>
  );
}
