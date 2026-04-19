interface TabsProps<T extends string> {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}

export function Tabs<T extends string>({ value, options, onChange, ariaLabel }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded border border-line p-1 bg-surface" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded text-[13px] font-medium transition
            ${value === o.value ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'}`}
        >
          {o.label}
          {o.count != null && (
            <span className="ml-1.5 font-mono text-[11px] opacity-70">{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
