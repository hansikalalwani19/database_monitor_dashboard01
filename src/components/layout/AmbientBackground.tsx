import React from "react";
import { Theme } from "../../types";

const NODES = [
  { x: 8, y: 78 },
  { x: 20, y: 55 },
  { x: 34, y: 68 },
  { x: 30, y: 40 },
  { x: 48, y: 30 },
  { x: 55, y: 58 },
  { x: 68, y: 42 },
  { x: 78, y: 62 },
  { x: 90, y: 35 },
  { x: 62, y: 80 },
  { x: 14, y: 25 },
  { x: 84, y: 88 },
];

const EDGES = [
  [0, 1],
  [1, 3],
  [1, 2],
  [3, 4],
  [4, 5],
  [2, 5],
  [5, 6],
  [6, 7],
  [6, 8],
  [7, 9],
  [4, 10],
  [7, 11],
];

export function AmbientBackground({
  T,
  mouse,
}: {
  T: Theme;
  mouse: { x: number; y: number };
}) {
  const px = mouse.x;
  const py = mouse.y;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: T.bg }} />
      <div
        className="db-aurora-a absolute rounded-full"
        style={{
          width: "60%",
          height: "50%",
          top: "-15%",
          left: "-10%",
          background: `radial-gradient(ellipse at center, ${T.auroraA}, transparent 70%)`,
          opacity: 0.16,
          filter: "blur(90px)",
        }}
      />
      <div
        className="db-aurora-b absolute rounded-full"
        style={{
          width: "55%",
          height: "45%",
          top: "10%",
          right: "-12%",
          background: `radial-gradient(ellipse at center, ${T.auroraB}, transparent 70%)`,
          opacity: 0.15,
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "70%",
          height: "40%",
          bottom: "-18%",
          left: "15%",
          background: `radial-gradient(ellipse at center, ${T.auroraC}, transparent 72%)`,
          opacity: 0.12,
          filter: "blur(110px)",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.06 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g
          className="db-contour"
          stroke={T.bgInk}
          fill="none"
          strokeWidth="0.18"
        >
          {[18, 32, 48, 64, 80, 96].map((y, i) => (
            <path
              key={i}
              d={`M-20,${y} Q ${10 + i * 3},${y - 6} ${30 + i * 2},${y} T ${70 + i * 2},${y - 4} T ${130},${y}`}
            />
          ))}
        </g>
      </svg>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.22 }}
      >
        <g stroke={T.auroraA} strokeWidth="0.15" fill="none">
          {EDGES.map(([a, b], i) => {
            const A = NODES[a];
            const B = NODES[b];
            const mx = (A.x + B.x) / 2 + (i % 2 === 0 ? 3 : -3);
            const my = (A.y + B.y) / 2 + (i % 3 === 0 ? -3 : 3);
            return (
              <path
                key={i}
                className="db-thread"
                style={{ animationDelay: `${i * 0.4}s` }}
                d={`M${A.x},${A.y} Q ${mx},${my} ${B.x},${B.y}`}
                strokeDasharray="1.4 2.2"
              />
            );
          })}
        </g>
        <g fill={T.auroraA}>
          {NODES.map((n, i) => (
            <circle
              key={i}
              className="db-mnode"
              style={{ animationDelay: `${i * 0.35}s` }}
              cx={n.x}
              cy={n.y}
              r={i % 3 === 0 ? 0.9 : 0.6}
            />
          ))}
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(420px circle at ${px}px ${py}px, ${T.auroraA}14, transparent 65%)`,
          transition: "background 0.25s ease-out",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${(px / vw - 0.5) * -14}px, ${(py / vh - 0.5) * -10}px)`,
          transition: "transform 0.4s ease-out",
          background: `radial-gradient(600px circle at 30% 20%, ${T.auroraB}0A, transparent 60%)`,
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.03, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
