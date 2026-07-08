import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Theme } from "../../types";

interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  T,
  centerLabel,
  centerValue,
}: {
  data: DonutDataItem[];
  T: Theme;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  return (
    <div className="relative" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={3}
            strokeWidth={0}
            animationDuration={700}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Inter",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-xl font-semibold"
            style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
          >
            {centerValue}
          </span>
          <span
            className="text-[11px]"
            style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
          >
            {centerLabel}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
        {data.map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name} · {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}
