import { useRef, useState, CSSProperties } from "react";

interface TiltResult {
  ref: React.RefObject<HTMLDivElement>;
  style: CSSProperties;
  onMove: (e: React.MouseEvent) => void;
  onLeave: () => void;
}

export function useTilt(max = 4): TiltResult {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(700px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(700px) rotateX(0deg) rotateY(0deg)",
    });
  };

  return { ref, style, onMove, onLeave };
}
