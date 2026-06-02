import { motion, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 origin-left"
      style={{ scaleX }}
    />
  );
}
