import { useEffect, useState } from "react";

interface Props {
  scanning: boolean;
  done: boolean;
  hours: number;
  setHours: (n: number) => void;
}

const fmt = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

export function ScanStatusBar({ scanning, done }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!scanning) {
      if (!done) setElapsed(0);
      return;
    }
    setElapsed(0);
    const start = Date.now();
    const t = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(t);
  }, [scanning, done]);

  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-3xl md:text-4xl tracking-[0.06em] tabular-nums">
        {fmt(elapsed)}
      </span>
      <span className="text-[9px] tracking-[0.32em] text-muted-foreground mt-1">
        Tempo de varredura
      </span>
    </div>
  );
}
