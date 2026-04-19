import type { CSSProperties } from 'react';

type IconName =
  | 'map-pin' | 'locate' | 'search' | 'arrow-right' | 'arrow-left'
  | 'clock' | 'phone' | 'star' | 'star-fill' | 'check' | 'x'
  | 'printer' | 'receipt' | 'history' | 'user' | 'log-out'
  | 'plus' | 'chevron-right' | 'chevron-down' | 'home'
  | 'briefcase' | 'coffee' | 'plane' | 'menu' | 'info'
  | 'alert' | 'shield' | 'credit-card' | 'route' | 'car'
  | 'trending-up' | 'wallet' | 'eye';

export function Icon({ name, size = 16, stroke = 1.75, style, className }: {
  name: IconName; size?: number; stroke?: number; style?: CSSProperties; className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    'map-pin':    (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>),
    'locate':     (<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2"/></>),
    'search':     (<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>),
    'arrow-right':(<><path d="M5 12h14M13 5l7 7-7 7"/></>),
    'arrow-left': (<><path d="M19 12H5M11 5l-7 7 7 7"/></>),
    'clock':      (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
    'phone':      (<><path d="M22 16.92V21a1 1 0 0 1-1.09 1 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.18 4.09 1 1 0 0 1 4.17 3h4.09a1 1 0 0 1 1 .75l1 3.5a1 1 0 0 1-.29 1l-1.72 1.72a16 16 0 0 0 6 6l1.72-1.72a1 1 0 0 1 1-.29l3.5 1a1 1 0 0 1 .75 1Z"/></>),
    'star':       (<><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"/></>),
    'star-fill':  (<path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z" fill="currentColor"/>),
    'check':      (<><path d="m5 12 5 5L20 7"/></>),
    'x':          (<><path d="M18 6 6 18M6 6l12 12"/></>),
    'printer':    (<><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>),
    'receipt':    (<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2z"/><path d="M8 7h8M8 11h8M8 15h5"/></>),
    'history':    (<><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.13-6.36L3 8"/><path d="M12 7v5l3 2"/></>),
    'user':       (<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>),
    'log-out':    (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>),
    'plus':       (<><path d="M12 5v14M5 12h14"/></>),
    'chevron-right': (<><path d="m9 6 6 6-6 6"/></>),
    'chevron-down':  (<><path d="m6 9 6 6 6-6"/></>),
    'home':       (<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>),
    'briefcase':  (<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>),
    'coffee':     (<><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v3M10 2v3M14 2v3"/></>),
    'plane':      (<><path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l5 5.5-3.3 3.3a.5.5 0 0 0 0 .7l1.5 1.5a.5.5 0 0 0 .7 0L11.5 15l5.5 5a.5.5 0 0 0 .8-.5Z"/></>),
    'menu':       (<><path d="M3 6h18M3 12h18M3 18h18"/></>),
    'info':       (<><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></>),
    'alert':      (<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></>),
    'shield':     (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></>),
    'credit-card':(<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>),
    'route':      (<><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h4"/></>),
    'car':        (<><path d="M3 17h18v-4l-2-5H5l-2 5Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>),
    'trending-up':(<><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>),
    'wallet':     (<><path d="M20 12V7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></>),
    'eye':        (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>),
  };
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true"
    >{paths[name]}</svg>
  );
}
