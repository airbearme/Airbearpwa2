import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RickshawWheelProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  glowing?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-3",
  lg: "w-16 h-16 border-4", 
  xl: "w-24 h-24 border-6",
};

const spokeClasses = {
  sm: "w-3 h-0.5",
  md: "w-5 h-0.5", 
  lg: "w-8 h-1",
  xl: "w-12 h-1.5",
};

export default function RickshawWheel({ 
  size = "md", 
  className, 
  animated = true,
  glowing = false,
  onClick 
}: RickshawWheelProps) {
  const wheelClass = cn(
    "border-lime-500 rounded-full relative cursor-pointer transition-all duration-300",
    sizeClasses[size],
    animated && "animate-wheel-spin",
    glowing && "animate-neon-glow",
    "hover:scale-110 hover:border-primary",
    className
  );

  const spokeClass = cn(
    "bg-lime-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    spokeClasses[size]
  );

  return (
    <motion.div 
      className={wheelClass}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      data-testid="rickshaw-wheel"
    >
      {/* Horizontal spoke */}
      <div className={spokeClass}></div>
      {/* Vertical spoke */}
      <div className={cn(spokeClass, "rotate-90")}></div>
      {/* Diagonal spokes for larger sizes */}
      {(size === "lg" || size === "xl") && (
        <>
          <div className={cn(spokeClass, "rotate-45")}></div>
          <div className={cn(spokeClass, "rotate-135")}></div>
        </>
      )}
    </motion.div>
  );
}
