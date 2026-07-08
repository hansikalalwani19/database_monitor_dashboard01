import { SearchX, ShieldAlert, RefreshCw } from "lucide-react";
import { Theme } from "../../types";

function IllustrationBlob({
  color,
  Icon,
}: {
  color: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
  return (
    <div className="relative w-16 h-16 mb-4">
      <div
        className="absolute inset-0 rounded-2xl rotate-6"
        style={{ background: `${color}18` }}
      />
      <div
        className="absolute inset-0 rounded-2xl -rotate-6"
        style={{ background: `${color}0D` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  );
}

export function EmptyState({
  T,
  title = "No results found",
  sub = "Try adjusting your search or filters.",
  onClear,
}: {
  T: Theme;
  title?: string;
  sub?: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <IllustrationBlob color="#A9821F" Icon={SearchX} />
      <p
        className="font-semibold mb-1"
        style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
      >
        {title}
      </p>
      <p
        className="text-sm mb-4"
        style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
      >
        {sub}
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium px-4 py-2 rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            background: T.primaryBg,
            color: T.primary,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  T,
  onRetry,
}: {
  T: Theme;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <IllustrationBlob color={T.error} Icon={ShieldAlert} />
      <p
        className="font-semibold mb-1"
        style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
      >
        Unable to load this data
      </p>
      <p
        className="text-sm mb-4"
        style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
      >
        Please try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            background: T.error,
            color: "#FFF8EC",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
