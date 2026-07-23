"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, Variants, type Easing } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  tag?: React.ElementType;
  delay?: number;
  stagger?: number;
  duration?: number;
  from?: { opacity?: number; y?: number; x?: number; scale?: number };
  to?: { opacity?: number; y?: number; x?: number; scale?: number };
  ease?: Easing;
}

export default function SplitText(props: SplitTextProps) {
  const {
    text,
    className = "",
    tag: Tag = "h1",
    delay = 0.1,
    stagger = 0.04,
    duration = 0.5,
    from = { opacity: 0, y: 30 },
    to = { opacity: 1, y: 0 },
    ease = "easeOut",
  } = props;

  const [animationKey, setAnimationKey] = useState(0);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (!hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      const timer = setTimeout(() => setAnimationKey(1), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleMouseEnter() {
    setAnimationKey((k) => k + 1);
  }

  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: from,
    visible: {
      ...to,
      transition: { duration, ease },
    },
  };

  const TagComp = (() => {
    switch (Tag) {
      case "h2": return motion.h2;
      case "h3": return motion.h3;
      case "p": return motion.p;
      case "span": return motion.span;
      case "div": return motion.div;
      default: return motion.h1;
    }
  })();

  const TagCompTyped = TagComp as React.ComponentType<Record<string, unknown>>;

  return (
    <TagCompTyped
      key={animationKey}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={handleMouseEnter}
      className={`inline-block cursor-default ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={childVariants}
              className="inline-block"
              style={{ willChange: "transform, opacity" }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </TagCompTyped>
  );
}
