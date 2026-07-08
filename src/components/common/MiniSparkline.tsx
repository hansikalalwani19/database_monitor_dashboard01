import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { SparklinePoint } from "../../types";

export function MiniSparkline({
  data,
  color,
}: {
  data: SparklinePoint[];
  color: string;
}) {
  const gid = `spark-${color.replace("#", "")}`;

  return (
    <div style={{ width: 64, height: 26 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gid})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
