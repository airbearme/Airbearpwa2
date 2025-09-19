import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AirbearWheelProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  glowing?: boolean;
  onClick?: () => void;
  effectType?: 'fire' | 'neon' | 'holographic' | 'plasma' | 'solar' | 'eco';
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

export default function AirbearWheel({ 
  size = "md", 
  className, 
  animated = true,
  glowing = false,
  onClick,
  effectType = 'neon'
}: AirbearWheelProps) {
  const [currentEffect, setCurrentEffect] = useState<typeof effectType>(effectType);
  
  const wheelClass = cn(
    "border-lime-500 rounded-full relative cursor-pointer transition-all duration-300 overflow-hidden",
    sizeClasses[size],
    animated && "animate-wheel-spin",
    glowing && "animate-neon-glow",
    "hover:scale-110 hover:border-primary group",
    currentEffect === 'fire' && "shadow-[0_0_20px_rgba(255,69,0,0.8)] animate-rolling-fire",
    currentEffect === 'plasma' && "shadow-[0_0_30px_rgba(147,51,234,0.8)] animate-plasma-vortex",
    currentEffect === 'holographic' && "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-holo-shimmer",
    currentEffect === 'solar' && "shadow-[0_0_25px_rgba(255,193,7,0.9)] animate-god-rays",
    currentEffect === 'eco' && "shadow-[0_0_15px_rgba(34,197,94,0.7)] animate-eco-breeze",
    className
  );

  const spokeClass = cn(
    "bg-lime-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary transition-colors",
    spokeClasses[size]
  );

  useEffect(() => {
    if (animated) {
      const effects = ['fire', 'neon', 'holographic', 'plasma', 'solar', 'eco'] as const;
      const interval = setInterval(() => {
        setCurrentEffect(effects[Math.floor(Math.random() * effects.length)]);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <motion.div 
      className={wheelClass}
      onClick={onClick}
      whileHover={{ scale: 1.3, rotate: 1080 }}
      whileTap={{ scale: 0.9 }}
      data-testid="airbear-wheel"
      onHoverStart={() => setCurrentEffect('fire')}
      onHoverEnd={() => setCurrentEffect(effectType)}
    >
      {/* Enhanced Fire/Smoke effect with rolling burning wheels */}
      {currentEffect === 'fire' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Burning wheel trail with enhanced sparks */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 22.5 * Math.PI / 180) * 40}%`,
                  top: `${50 + Math.sin(i * 22.5 * Math.PI / 180) * 40}%`,
                }}
                animate={{
                  scale: [0.3, 2, 0],
                  opacity: [1, 0.8, 0],
                  rotate: [0, 360, 720],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.03,
                }}
              />
            ))}
          </motion.div>
          
          {/* Enhanced smoke particles with realistic physics */}
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={`smoke-${i}`}
              className="absolute w-3 h-3 bg-gray-600 rounded-full opacity-70"
              style={{
                left: `${40 + Math.random() * 30}%`,
                top: `${40 + Math.random() * 30}%`,
              }}
              animate={{
                scale: [0, 1.5, 3],
                opacity: [0.7, 0.4, 0],
                y: [-5, -40, -80],
                x: [0, Math.random() * 30 - 15],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Enhanced Solar effect with prismatic rays */}
      {currentEffect === 'solar' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* God rays with rainbow spectrum */}
          {Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute w-1 h-8 opacity-60"
              style={{
                left: '50%',
                top: '-16px',
                transformOrigin: '50% 32px',
                transform: `rotate(${i * 15}deg)`,
                background: `linear-gradient(to top, 
                  hsl(${(i * 15) % 360}, 80%, 60%), 
                  hsl(${(i * 15 + 60) % 360}, 80%, 70%), 
                  hsl(${(i * 15 + 120) % 360}, 80%, 80%))`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.4, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Prismatic center glow */}
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-red-400 opacity-40"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      
      {/* Enhanced Holographic effect with rainbow shimmer and depth */}
      {currentEffect === 'holographic' && (
        <>
          <motion.div
            className="absolute inset-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 via-green-400 via-yellow-400 to-purple-400 opacity-50"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-r from-transparent via-white via-cyan-200 to-transparent opacity-80"
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-white opacity-60"
            animate={{ rotate: 720, opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </>
      )}
      
      {/* Enhanced Plasma effect with vortex and energy rings */}
      {currentEffect === 'plasma' && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-40 animate-plasma-vortex" />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-cyan-400 opacity-60"
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-purple-400 opacity-40"
            animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </>
      )}

      {/* Enhanced Eco effect with nature particles */}
      {currentEffect === 'eco' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Floating leaves */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute text-green-500 opacity-70"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
                fontSize: '12px',
              }}
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
                rotate: [0, 360, 720],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              🍃
            </motion.div>
          ))}
          
          {/* Clean air breeze effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400 opacity-30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}

      {/* Enhanced AirBear logo center with multiple effects */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary relative">
        <motion.div
          animate={{ 
            rotate: currentEffect === 'fire' ? 360 : currentEffect === 'plasma' ? -360 : 0,
            scale: currentEffect === 'solar' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            duration: currentEffect === 'fire' ? 1 : currentEffect === 'plasma' ? 2 : 3, 
            repeat: Infinity 
          }}
          className="relative text-2xl"
        >
          🐻
          {glowing && (
            <div className="absolute inset-0 text-2xl font-bold text-primary blur-sm animate-pulse">
              🐻
            </div>
          )}
          
          {/* Aura effect */}
          <motion.div
            className="absolute inset-0 text-2xl text-cyan-400 opacity-30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            🐻
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced spokes with gradient effects */}
      <motion.div 
        className={cn(spokeClass, "shadow-lg bg-gradient-to-r from-lime-400 via-emerald-500 to-lime-400")}
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div 
        className={cn(spokeClass, "rotate-90 shadow-lg bg-gradient-to-r from-lime-400 via-emerald-500 to-lime-400")}
        animate={{ opacity: [1, 0.7, 1], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
      />
      {(size === "lg" || size === "xl") && (
        <>
          <motion.div 
            className={cn(spokeClass, "rotate-45 shadow-lg bg-gradient-to-r from-lime-400 via-emerald-500 to-lime-400")}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div 
            className={cn(spokeClass, "rotate-135 shadow-lg bg-gradient-to-r from-lime-400 via-emerald-500 to-lime-400")}
            animate={{ opacity: [1, 0.7, 1], scale: [1.2, 1, 1.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
          />
        </>
      )}
      
      {/* Confetti burst on hover with enhanced particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 45}%`,
            top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 45}%`,
            background: `hsl(${i * 30}, 80%, 60%)`,
          }}
          animate={{
            scale: [0, 2, 0],
            rotate: [0, 720, 1440],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.08,
          }}
        />
      ))}
      
      {/* Energy trails for enhanced movement */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-400 opacity-20"
          animate={{ 
            scale: [1, 1.8, 1], 
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 360] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}