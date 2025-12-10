"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // 磁力强度
}

export default function MagneticButton({ children, className, onClick, strength = 0.5 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 使用弹簧物理效果使移动更自然
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      onClick={onClick}
      className={cn("relative cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}

