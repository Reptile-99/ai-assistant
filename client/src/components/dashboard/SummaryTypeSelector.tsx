'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SummaryTypeInfo, SummaryType } from '@/services/ai.service';

interface SummaryTypeSelectorProps {
  types: SummaryTypeInfo[];
  selected: SummaryType;
  onChange: (type: SummaryType) => void;
  disabled?: boolean;
}

const typeColors: Record<SummaryType, string> = {
  short: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
  detailed: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/40',
  bullet: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
  key_concepts: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
};

const activeColors: Record<SummaryType, string> = {
  short: 'border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/15',
  detailed: 'border-violet-500/50 bg-violet-500/10 shadow-violet-500/15',
  bullet: 'border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/15',
  key_concepts: 'border-amber-500/50 bg-amber-500/10 shadow-amber-500/15',
};

export function SummaryTypeSelector({
  types,
  selected,
  onChange,
  disabled,
}: SummaryTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {types.map((type) => {
        const isActive = type.id === selected;
        return (
          <motion.button
            key={type.id}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            disabled={disabled}
            onClick={() => onChange(type.id)}
            className={cn(
              'group relative flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border text-left transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isActive
                ? `${activeColors[type.id]} shadow-lg`
                : 'border-border bg-secondary/30 hover:bg-secondary/60'
            )}
          >
            {/* Active ring */}
            {isActive && (
              <motion.div
                layoutId="activeSummaryType"
                className="absolute inset-0 rounded-2xl border-2 border-current opacity-20 pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            <span
              className={cn(
                'text-xl w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
                typeColors[type.id]
              )}
            >
              {type.icon}
            </span>

            {/* Label */}
            <div>
              <p className={cn(
                'text-sm font-semibold transition-colors',
                isActive ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
              )}>
                {type.label}
              </p>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                {type.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
