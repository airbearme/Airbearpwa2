import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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
  const [effectType, setEffectType] = useState<'fire' | 'neon' | 'holographic' | 'plasma'>('neon');
  
  const wheelClass = cn(
    "border-lime-500 rounded-full relative cursor-pointer transition-all duration-300 overflow-hidden",
    sizeClasses[size],
    animated && "animate-wheel-spin",
    glowing && "animate-neon-glow",
    "hover:scale-110 hover:border-primary group",
    effectType === 'fire' && "shadow-[0_0_20px_rgba(255,69,0,0.8)]",
    effectType === 'plasma' && "shadow-[0_0_30px_rgba(147,51,234,0.8)]",
    effectType === 'holographic' && "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
    className
  );

  const spokeClass = cn(
    "bg-lime-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary transition-colors",
    spokeClasses[size]
  );

  useEffect(() => {
    const effects = ['fire', 'neon', 'holographic', 'plasma'] as const;
    const interval = setInterval(() => {
      setEffectType(effects[Math.floor(Math.random() * effects.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className={wheelClass}
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: 360 }}
      whileTap={{ scale: 0.95 }}
      data-testid="airbear-wheel"
      onHoverStart={() => setEffectType('fire')}
      onHoverEnd={() => setEffectType('neon')}
    >
      {/* Fire/Smoke effect on hover */}
      {effectType === 'fire' && (
        <div className="absolute inset-0 rounded-full">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
              style={{
                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 20}%`,
                top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 20}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 0.8, 0],
                y: [-5, -15, -25],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Holographic effect */}
      {effectType === 'holographic' && (
        <motion.div
          className="absolute inset-1 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Plasma effect */}
      {effectType === 'plasma' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 animate-pulse" />
      )}

      {/* AirBear logo center */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
        🐻
      </div>

      {/* Enhanced spokes with AirBear branding */}
      <div className={cn(spokeClass, "shadow-lg")}></div>
      <div className={cn(spokeClass, "rotate-90 shadow-lg")}></div>
      {(size === "lg" || size === "xl") && (
        <>
          <div className={cn(spokeClass, "rotate-45 shadow-lg")}></div>
          <div className={cn(spokeClass, "rotate-135 shadow-lg")}></div>
        </>
      )}
      
      {/* Solar rays effect */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-3 bg-yellow-400 opacity-60"
          style={{
            left: '50%',
            top: '-6px',
            transformOrigin: '50% 20px',
            transform: `rotate(${i * 45}deg)`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  );
}
