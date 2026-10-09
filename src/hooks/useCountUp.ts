import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function useCountUp(target: number, duration = 0.8): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  const current = useRef(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      current.current = target;
      setValue(target);
      return;
    }
    const controls = animate(current.current, target, {
      duration,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => {
        current.current = v;
        setValue(v);
      }
    });
    return () => controls.stop();
  }, [target, duration, reduce]);

  return Math.round(value);
}