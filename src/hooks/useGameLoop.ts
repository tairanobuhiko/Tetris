import { useEffect, useRef } from 'react';

// 日本語: requestAnimationFrame ベースのループ。tickMs ごとにコールバック。
export function useGameLoop(callback: () => void, tickMs: number) {
  const startRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    accRef.current = 0;

    const loop = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const dt = now - (startRef.current ?? now);
      startRef.current = now;
      accRef.current += dt;
      if (accRef.current >= tickMs) {
        // 閾値を超えた分だけ tick 実行
        const steps = Math.floor(accRef.current / tickMs);
        for (let i = 0; i < steps; i++) callback();
        accRef.current = accRef.current % tickMs;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [callback, tickMs]);
}

