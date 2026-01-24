"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const Counter = ({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const start = 0;
      const end = target;
      const startTime = Date.now();

      const updateCount = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.round(start + (end - start) * easeOut);
        setCount(currentCount);
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      updateCount();
    }
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

const stats = [
  {
    value: 87,
    suffix: "%",
    label: "Prediction accuracy",
    description: "Our AI correctly identifies viral content",
  },
  {
    value: 6,
    suffix: "",
    label: "Platforms supported",
    description: "Twitter, LinkedIn, TikTok, and more",
  },
  {
    value: 5,
    prefix: "<",
    suffix: "s",
    label: "Generation time",
    description: "Content created in seconds",
  },
  {
    value: 50,
    suffix: "+",
    label: "Beta users",
    description: "Creators already on the platform",
  },
];

export const StatsSection: React.FC = () => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="py-24 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Numbers that matter
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Real metrics from real creators using XELORA to predict and capture viral moments
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                <Counter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
