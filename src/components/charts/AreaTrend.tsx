import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Theme, ChartKeyConfig } from "../../types";

interface TrendDataItem {
  label: string;
  [key: string]: string | number;
}

export function AreaTrend({
  data,
  T,
  keys,
  height = 240,
}: {
  data: TrendDataItem[];
  T: Theme;
  keys: ChartKeyConfig[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            {keys.map((k) => (
              <linearGradient
                key={k.key}
                id={`grad-${k.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={k.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={k.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={T.cardBorder} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: T.inkFaint, fontSize: 10, fontFamily: "Inter" }}
            axisLine={{ stroke: T.cardBorder }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: T.inkFaint, fontSize: 10, fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Inter",
            }}
            labelStyle={{ color: T.inkDim }}
          />
          {keys.map((k) => (
            <Area
              key={k.key}
              type="monotone"
              dataKey={k.key}
              name={k.name}
              stroke={k.color}
              fill={`url(#grad-${k.key})`}
              strokeWidth={2}
              animationDuration={600}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
