import { motion } from "framer-motion";

export function OrbitBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Orbit rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[280, 440, 620, 820].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-primary/15"
            style={{
              width: size,
              height: size,
              left: -size / 2,
              top: -size / 2,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 40 + i * 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Node on orbit */}
            <div
              className="absolute h-3 w-3 rounded-full bg-accent shadow-glow animate-orbit-pulse"
              style={{ top: -6, left: size / 2 - 6 }}
            />
            {i % 2 === 0 && (
              <div
                className="absolute h-2 w-2 rounded-full bg-primary shadow-glow"
                style={{ bottom: -4, right: size / 2 - 4 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Central glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-primary/30 blur-3xl animate-orbit-pulse" />

      {/* Star dots */}
      <svg className="absolute inset-0 h-full w-full opacity-60">
        {Array.from({ length: 50 }).map((_, i) => {
          const x = (i * 137.5) % 100;
          const y = (i * 73.3) % 100;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={Math.random() > 0.7 ? 1.5 : 0.8}
              fill="white"
              opacity={Math.random() * 0.6 + 0.2}
            />
          );
        })}
      </svg>
    </div>
  );
}
