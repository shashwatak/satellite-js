import { useEffect, useRef, useState } from 'react';
import styles from './FlyingSatellite.module.css';

function randomEdgeAndDirection(width, height, margin = 32) {
  // pick a random point along the perimeter
  const perim = 2 * (width + height);
  const p = Math.random() * perim;
  let start: { x: number, y: number }, end: { x: number, y: number };
  if (p < width) { // top
    const x = p;
    start = { x, y: -margin };
    end = { x: width - x, y: height + margin };
  } else if (p < width + height) { // right
    const y = p - width;
    start = { x: width + margin, y };
    end = { x: -margin, y: height - y };
  } else if (p < 2 * width + height) { // bottom
    const x = width - (p - (width + height));
    start = { x, y: height + margin };
    end = { x: width - x, y: -margin };
  } else { // left
    const y = height - (p - (2 * width + height));
    start = { x: -margin, y };
    end = { x: width + margin, y: height - y };
  }

  const angle = Math.random() * 360;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return { start, end, angle, distance };
}

const SATELLITE_SIZE = 12; // px
const RUN_MIN = 10; // seconds
const RUN_MAX = 30; // seconds

const SATELLITE_SPEED = 0.5; // px/sec, controls how fast satellite moves
const FlyingSatellite = () => {
  const containerRef = useRef(null);
  const [params, setParams] = useState(null);
  const [key, setKey] = useState(0); // for re-rendering

  useEffect(() => {
    function startNewRun() {
      const container = containerRef.current;
      if (!container) return;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const { start, end, angle, distance } = randomEdgeAndDirection(width, height);

      const runDuration = Math.max(RUN_MIN, Math.min(RUN_MAX, distance / SATELLITE_SPEED + (Math.random() - 0.5)));
      setParams({
        start,
        end,
        angle,
        runDuration,
        size: SATELLITE_SIZE * (0.8 + Math.random() * 0.4),
      });
      setKey(k => k + 1); // force re-render for animation restart
    }
    startNewRun();
  }, []);

  useEffect(() => {
    if (!params) return;
    const timer = setTimeout(() => {
      setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const { start, end, angle, distance } = randomEdgeAndDirection(width, height);
        const runDuration = Math.max(RUN_MIN, Math.min(RUN_MAX, distance / SATELLITE_SPEED + (Math.random() - 0.5)));
        setParams({
          start,
          end,
          angle,
          runDuration,
          size: SATELLITE_SIZE * (0.8 + Math.random() * 0.4),
        });
        setKey(k => k + 1);
      }, 1000 + Math.random() * 4000);
    }, params.runDuration * 1000);
    return () => clearTimeout(timer);
  }, [params]);

  if (!params) {
    return <div ref={containerRef} className={styles.satContainer} />;
  }

  const { start, end, angle, runDuration, size } = params;
  const style = {
    '--sat-x0': `${start.x}px`,
    '--sat-y0': `${start.y}px`,
    '--sat-x1': `${end.x}px`,
    '--sat-y1': `${end.y}px`,
    '--sat-angle': `${angle}deg`,
    '--sat-size': `${size}px`,
    '--sat-run-duration': `${runDuration}s`,
  };

  return (
    <div ref={containerRef} className={styles.satContainer}>
      <div
        key={key}
        className={styles.satellite}
        style={style as React.CSSProperties}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: 'block', transform: `rotate(${angle}deg)` }}
          role="presentation"
        >
          {/* four-pointed star */}
          <polygon
            points={`
              ${size / 2},0
              ${size * 0.62},${size * 0.38}
              ${size},${size / 2}
              ${size * 0.62},${size * 0.62}
              ${size / 2},${size}
              ${size * 0.38},${size * 0.62}
              0,${size / 2}
              ${size * 0.38},${size * 0.38}
            `}
            fill="white"
            filter="url(#glow)"
            opacity="1"
          />
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default FlyingSatellite;
