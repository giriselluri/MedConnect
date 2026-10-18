'use client';

import React from 'react';
import {
  Heart,
  ShieldAlert,
  Brain,
  Baby,
  Sparkles,
  Stethoscope,
  ScanLine,
  Shield,
  Activity,
  Ambulance,
  Microscope,
  Smile,
  Wind,
  Droplet,
  Bone,
} from 'lucide-react';

interface SpecialtyBadgeProps {
  id?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
  showIcon?: boolean;
}

export function SpecialtyBadge({
  id,
  name,
  size = 'md',
  active = false,
  onClick,
  showIcon = true,
}: SpecialtyBadgeProps) {
  const getIcon = (specialtyKey?: string, specialtyName?: string) => {
    const key = (specialtyKey || specialtyName || '').toLowerCase();
    if (key.includes('cardio') || key.includes('heart')) return <Heart className="w-3.5 h-3.5 text-rose-500" />;
    if (key.includes('oncol') || key.includes('cancer')) return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
    if (key.includes('neuro') || key.includes('brain')) return <Brain className="w-3.5 h-3.5 text-indigo-500" />;
    if (key.includes('pediat') || key.includes('child')) return <Baby className="w-3.5 h-3.5 text-sky-500" />;
    if (key.includes('derma') || key.includes('skin')) return <Sparkles className="w-3.5 h-3.5 text-pink-500" />;
    if (key.includes('internal') || key.includes('hospital')) return <Stethoscope className="w-3.5 h-3.5 text-teal-600" />;
    if (key.includes('radio') || key.includes('imag')) return <ScanLine className="w-3.5 h-3.5 text-blue-500" />;
    if (key.includes('immuno') || key.includes('allergy')) return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
    if (key.includes('endo') || key.includes('diabet')) return <Activity className="w-3.5 h-3.5 text-purple-500" />;
    if (key.includes('emerg') || key.includes('trauma')) return <Ambulance className="w-3.5 h-3.5 text-red-500" />;
    if (key.includes('gastro') || key.includes('digest')) return <Microscope className="w-3.5 h-3.5 text-lime-600" />;
    if (key.includes('psych')) return <Smile className="w-3.5 h-3.5 text-yellow-600" />;
    if (key.includes('pulmon') || key.includes('lung')) return <Wind className="w-3.5 h-3.5 text-cyan-600" />;
    if (key.includes('nephro') || key.includes('renal')) return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
    if (key.includes('ortho') || key.includes('bone')) return <Bone className="w-3.5 h-3.5 text-slate-500" />;
    return <Stethoscope className="w-3.5 h-3.5 text-teal-600" />;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium transition-colors border ${
        active
          ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
          : 'bg-teal-50/70 text-teal-900 border-teal-200 hover:bg-teal-100 hover:border-teal-300'
      } ${sizeClasses[size]} ${onClick ? 'cursor-pointer select-none' : ''}`}
    >
      {showIcon && !active && getIcon(id, name)}
      <span>{name}</span>
    </span>
  );
}
