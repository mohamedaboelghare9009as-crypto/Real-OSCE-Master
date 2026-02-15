import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceReactiveSphereProps {
  isActive?: boolean;
  intensity?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  mode?: 'patient' | 'nurse';
}

export const VoiceReactiveSphere: React.FC<VoiceReactiveSphereProps> = ({
  isActive = false,
  intensity = 0,
  color = '#3b82f6',
  size = 'lg',
  mode = 'patient'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [localIntensity, setLocalIntensity] = useState(intensity);
  
  const sizeMap = {
    sm: { canvas: 120, sphere: 80 },
    md: { canvas: 200, sphere: 140 },
    lg: { canvas: 320, sphere: 240 }
  };

  const dimensions = sizeMap[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let targetIntensity = isActive ? Math.max(0.3, intensity) : 0.1;
    let currentIntensity = targetIntensity;

    const animate = () => {
      time += 0.02;
      
      // Smooth intensity transition
      currentIntensity += (targetIntensity - currentIntensity) * 0.1;
      setLocalIntensity(currentIntensity);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, dimensions.canvas, dimensions.canvas);

      const centerX = dimensions.canvas / 2;
      const centerY = dimensions.canvas / 2;
      const baseRadius = dimensions.sphere / 2;

      // Create dynamic color based on mode and activity
      const hue = mode === 'patient' 
        ? 200 + Math.sin(time) * 20 // Blue range for patient
        : 280 + Math.sin(time) * 20; // Purple range for nurse
      
      const saturation = 70 + currentIntensity * 30;
      const lightness = 50 + currentIntensity * 20;

      // Draw outer glow rings
      for (let i = 3; i >= 0; i--) {
        const ringRadius = baseRadius + i * 15 + Math.sin(time * 2 + i) * 5;
        const alpha = (0.15 - i * 0.03) * currentIntensity;
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, ringRadius
        );
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw main sphere with wave distortion
      const waveAmplitude = 3 + currentIntensity * 8;
      const waveFrequency = 8 + Math.floor(currentIntensity * 4);
      
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const waveOffset = Math.sin(angle * waveFrequency + time * 3) * waveAmplitude;
        const radius = baseRadius + waveOffset;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Sphere gradient
      const sphereGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.3, centerY - baseRadius * 0.3, 0,
        centerX, centerY, baseRadius
      );
      sphereGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.95)`);
      sphereGradient.addColorStop(0.4, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`);
      sphereGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness - 20}%, 0.8)`);
      
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Add shine effect
      ctx.beginPath();
      ctx.ellipse(
        centerX - baseRadius * 0.3,
        centerY - baseRadius * 0.3,
        baseRadius * 0.25,
        baseRadius * 0.15,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + currentIntensity * 0.3})`;
      ctx.fill();

      // Draw inner energy particles when active
      if (currentIntensity > 0.2) {
        const particleCount = Math.floor(currentIntensity * 20);
        for (let i = 0; i < particleCount; i++) {
          const particleAngle = (time * 0.5 + (i / particleCount) * Math.PI * 2);
          const particleRadius = baseRadius * 0.6 + Math.sin(time * 2 + i) * 10;
          const px = centerX + Math.cos(particleAngle) * particleRadius;
          const py = centerY + Math.sin(particleAngle) * particleRadius;
          
          ctx.beginPath();
          ctx.arc(px, py, 2 + currentIntensity * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + currentIntensity * 0.4})`;
          ctx.fill();
        }
      }

      targetIntensity = isActive ? Math.max(0.3, intensity) : 0.1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, intensity, mode, dimensions]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={dimensions.canvas}
        height={dimensions.canvas}
        className="rounded-full"
        style={{
          filter: isActive ? `drop-shadow(0 0 ${20 + localIntensity * 30}px ${color})` : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      
      {/* Status indicator */}
      <motion.div
        className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
          isActive ? 'bg-green-400' : 'bg-slate-400'
        }`}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          opacity: isActive ? [1, 0.7, 1] : 0.5
        }}
        transition={{
          duration: 1,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default VoiceReactiveSphere;
