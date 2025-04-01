import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AnimatedNumber = ({ value, duration = 2, decimals = 0 }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let frame;
    const startTime = Date.now();
    const startValue = currentValue;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const current = startValue + (endValue - startValue) * progress;

      setCurrentValue(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(frame); // ✅ Cleanup function to prevent memory leaks
  }, [value, duration]);

  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {formatNumber(currentValue)}
    </motion.span>
  );
};
