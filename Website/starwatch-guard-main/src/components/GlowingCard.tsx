import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'secondary' | 'warning' | 'success';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export default function GlowingCard({ 
  children, 
  className = '', 
  glowColor = 'primary',
  intensity = 'medium',
  animated = true,
}: GlowingCardProps) {
  const glowStyles = {
    primary: 'shadow-glow-primary',
    secondary: 'shadow-glow-secondary', 
    warning: 'shadow-glow-warning',
    success: 'shadow-glow-success'
  };

  const intensityStyles = {
    low: 'opacity-60',
    medium: 'opacity-80',
    high: 'opacity-100'
  };

  const cardClasses = `
    glass-card holographic-border
    ${glowStyles[glowColor]}
    ${intensityStyles[intensity]}
    ${animated ? 'float-animation pulse-glow' : ''}
    ${className}
  `;

  const MotionCard = animated ? motion(Card) : Card;
  
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: { 
      y: -5, 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    transition: { duration: 0.5 }
  } : {};

  return (
    <MotionCard 
      className={cardClasses} 
      {...animationProps}
    >
      {children}
    </MotionCard>
  );
}