import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

/* Smooth numeric value tween count-up / count-down component */
export function AnimatedNumber({ value, duration = 600, formatter }: { value: number; duration?: number; formatter?: (val: number) => string }) {
  const [displayVal, setDisplayVal] = useState(value);
  const prevValRef = useRef(value);
  const activeTargetRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = prevValRef.current;
    const endVal = value;
    activeTargetRef.current = endVal;
    
    if (startVal === endVal) return;
    
    // Ensure any previously running frame is canceled
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    
    const step = (timestamp: number) => {
      if (activeTargetRef.current !== endVal) return; // Prevent race conditions
      
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress * (2 - progress); /* easeOutQuad */
      const current = startVal + (endVal - startVal) * ease;
      setDisplayVal(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayVal(endVal);
        prevValRef.current = endVal;
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  useEffect(() => {
    return () => {
      prevValRef.current = value;
    };
  }, [value]);

  const rounded = Math.round(displayVal);
  return <>{formatter ? formatter(rounded) : rounded}</>;
}

/* Mouse-tracking radial gradient spotlight panel */
interface GlowPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  dominant?: boolean;
}

export function GlowPanel({ children, className = "", dominant = false, ...props }: GlowPanelProps) {
  return (
    <div
      className={`bg-theme-panel/70 backdrop-blur-md border ${
        dominant 
          ? "border-theme-accent/50" 
          : "border-theme-border/40"
      } rounded-2xl shadow-lg shadow-black/5 transition-all duration-150 hover:shadow-black/10 ${className}`}
      {...props}
    >
      <div className="h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

/* Scroll-triggered reveal animation component */
export function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Spring physics magnetic button */
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function MagneticButton({ children, className = "", onClick, disabled, type = "button" }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !isMounted.current) return;
    const { pageX, pageY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    
    // Normalize against scroll offset
    const normalizedLeft = left + window.scrollX;
    const normalizedTop = top + window.scrollY;
    
    const centerX = normalizedLeft + width / 2;
    const centerY = normalizedTop + height / 2;
    const pullX = (pageX - centerX) * 0.15;
    const pullY = (pageY - centerY) * 0.15;
    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    if (isMounted.current) {
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      type={type}
      animate={{ x: position.x, y: position.y }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative select-none ${className}`}
    >
      {children}
    </motion.button>
  );
}
