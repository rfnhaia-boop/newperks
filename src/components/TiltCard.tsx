"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const [isHovered, setIsHovered] = useState(false);

  // Celular: inclina com o giroscópio (Android direto; iOS pede permissão, aí ignora)
  useEffect(() => {
    function handleOrientation(e: DeviceOrientationEvent) {
      if (e.gamma == null || e.beta == null) return;
      // gamma: -90..90 (esquerda/direita) | beta: -180..180 (frente/trás, ~45° segurando)
      x.set(Math.max(-0.5, Math.min(0.5, e.gamma / 60)));
      y.set(Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60)));
    }
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [x, y]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      <div 
        style={{ transform: "translateZ(60px)" }}
        className="w-full h-full relative group"
      >
        {/* Efeito de Glare (brilho reflexivo) sobre o cartão */}
        {isHovered && (
          <motion.div
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 60%)",
              left: glareX,
              top: glareY,
              transform: "translate(-50%, -50%)",
            }}
            className="pointer-events-none absolute h-[150%] w-[150%] z-50 rounded-full mix-blend-overlay"
          />
        )}
        {children}
      </div>
    </motion.div>
  );
}
