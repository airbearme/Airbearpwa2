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
import AirbearWheel from "./airbear-wheel";

export default function AirbearWheel({ 
  size = "md", 
  className, 
  animated = true,
  glowing = false,
  onClick 
}: AirbearWheelProps) {
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
      whileHover={{ scale: 1.2, rotate: 720 }}
      whileTap={{ scale: 0.9 }}
      data-testid="airbear-wheel"
      onHoverStart={() => setEffectType('fire')}
      onHoverEnd={() => setEffectType('neon')}
    >
      {/* Enhanced Fire/Smoke effect with rolling burning wheels */}
      {effectType === 'fire' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Burning wheel trail */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 35}%`,
                  top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 35}%`,
                }}
                animate={{
                  scale: [0.5, 1.5, 0],
                  opacity: [1, 0.7, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
          
          {/* Smoke particles */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={`smoke-${i}`}
              className="absolute w-2 h-2 bg-gray-400 rounded-full opacity-60"
              style={{
                left: `${45 + Math.random() * 20}%`,
                top: `${45 + Math.random() * 20}%`,
              }}
              animate={{
                scale: [0, 1, 2],
                opacity: [0.6, 0.3, 0],
                y: [-10, -30, -50],
                x: [0, Math.random() * 20 - 10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Enhanced Holographic effect with rainbow shimmer */}
      {effectType === 'holographic' && (
        <>
          <motion.div
            className="absolute inset-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 via-green-400 to-purple-400 opacity-40"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}
      
      {/* Enhanced Plasma effect with vortex */}
      {effectType === 'plasma' && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 animate-plasma" />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-cyan-400 opacity-50"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </>
      )}

      {/* Enhanced AirBear logo center with glow */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary relative">
        <motion.div
          animate={{ rotate: effectType === 'fire' ? 360 : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          🐻
          {glowing && (
            <div className="absolute inset-0 text-xs font-bold text-primary blur-sm animate-pulse">
              🐻
            </div>
          )}
        </motion.div>
      </div>

      {/* Enhanced spokes with special effects */}
      <motion.div 
        className={cn(spokeClass, "shadow-lg bg-gradient-to-r from-lime-400 to-emerald-500")}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div 
        className={cn(spokeClass, "rotate-90 shadow-lg bg-gradient-to-r from-lime-400 to-emerald-500")}
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
      />
      {(size === "lg" || size === "xl") && (
        <>
          <motion.div 
            className={cn(spokeClass, "rotate-45 shadow-lg bg-gradient-to-r from-lime-400 to-emerald-500")}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div 
            className={cn(spokeClass, "rotate-135 shadow-lg bg-gradient-to-r from-lime-400 to-emerald-500")}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
          />
        </>
      )}
      
      {/* Enhanced Solar rays with prismatic effect */}
      {Array.from({ length: 16 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-4 bg-gradient-to-t from-yellow-300 via-orange-300 to-red-300 opacity-70"
          style={{
            left: '50%',
            top: '-8px',
            transformOrigin: '50% 24px',
            transform: `rotate(${i * 22.5}deg)`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.4, 0.8],
            background: [
              'linear-gradient(to top, #fde047, #f97316, #dc2626)',
              'linear-gradient(to top, #a78bfa, #06b6d4, #10b981)',
              'linear-gradient(to top, #fde047, #f97316, #dc2626)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
      
      {/* Confetti burst on hover */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
            top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            rotate: [0, 360, 720],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  );
}
