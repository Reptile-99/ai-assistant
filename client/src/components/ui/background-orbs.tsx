'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[
        { size: 500, x: -10, y: -10, color: 'bg-violet-500/3' },
        { size: 400, x: 80, y: 70, color: 'bg-cyan-500/3' },
      ].map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: i * 2,
          }}
          className={cn('absolute rounded-full blur-3xl', orb.color)}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
        />
      ))}
    </div>
  );
}
