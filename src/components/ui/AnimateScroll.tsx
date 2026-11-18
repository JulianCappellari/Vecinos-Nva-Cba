"use client";
import { ReactNode } from "react";
import { Reveal } from "./motion";
import { TiltCard } from "./TiltCard";

interface AnimatedOnScrollProps {
  children: ReactNode;
  /** Se mantiene por compatibilidad: ahora la animación la hace GSAP ScrollTrigger */
  animationClass?: string;
}

const AnimatedOnScroll = ({ children }: AnimatedOnScrollProps) => (
  <Reveal variant="pop" className="w-full flex justify-center">
    <TiltCard className="w-full max-w-sm">{children}</TiltCard>
  </Reveal>
);

export default AnimatedOnScroll;
