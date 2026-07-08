import { Theme } from "../../types";

export function DateRangePicker({
  value,
  onChange,
  T,
}: {
  value: string;
  onChange: (v: string) => void;
  T: Theme;
}) {
  const opts = ["Today", "7D", "30D", "90D"];

  return (
    <div
      className="flex items-center rounded-lg p-0.5"
      style={{ background: T.surfaceMute }}
    >
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
          style={{
            background: value === o ? T.card : "transparent",
            color: value === o ? T.ink : T.inkDim,
            boxShadow: value === o ? "0 1px 2px rgba(20,30,20,0.1)" : "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
