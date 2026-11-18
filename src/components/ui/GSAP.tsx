"use client";
import { ReactNode } from "react";
import { Reveal } from "./motion";
import { TiltCard } from "./TiltCard";

interface Props {
  children: ReactNode;
  index?: number;
  animationClass?: string;
}

/** Tarjeta que entra con ScrollTrigger; el `index` escalona la entrada. */
const AnimatedSection = ({ children, index = 0, animationClass = "" }: Props) => (
  <Reveal
    variant="pop"
    delay={(index % 3) * 0.12}
    className={`w-full flex justify-center ${animationClass}`}
  >
    <TiltCard className="w-full max-w-sm">{children}</TiltCard>
  </Reveal>
);

export default AnimatedSection;
