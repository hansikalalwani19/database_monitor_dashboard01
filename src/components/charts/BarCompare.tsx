import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Theme } from "../../types";

interface BarDataItem {
  label: string;
  value: number;
}

export function BarCompare({
  data,
  T,
  dataKey = "value",
  color,
  height = 220,
  horizontal,
}: {
  data: BarDataItem[];
  T: Theme;
  dataKey?: string;
  color: string;
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{
            top: 4,
            right: 12,
            left: horizontal ? 40 : -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke={T.cardBorder}
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: T.inkFaint, fontSize: 10, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: T.inkDim, fontSize: 11, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                tick={{ fill: T.inkFaint, fontSize: 10, fontFamily: "Inter" }}
                axisLine={{ stroke: T.cardBorder }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: T.inkFaint, fontSize: 10, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Inter",
            }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
