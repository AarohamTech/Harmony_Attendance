import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'sky';
  subtitle?: string;
  trend?: string;
  onClick?: () => void;
}

const colorMap = {
  blue: {
    bg: 'bg-white',
    border: 'border-[#c3c6d7]/70',
    iconBg: 'bg-[#2563eb]/10 text-[#2563eb]',
    valueText: 'text-[#191b23]',
  },
  emerald: {
    bg: 'bg-white',
    border: 'border-emerald-200/80',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    valueText: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-white',
    border: 'border-amber-200/80',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    valueText: 'text-amber-700',
  },
  rose: {
    bg: 'bg-white',
    border: 'border-rose-200/80',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    valueText: 'text-rose-700',
  },
  indigo: {
    bg: 'bg-white',
    border: 'border-indigo-200/80',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
    valueText: 'text-indigo-900',
  },
  purple: {
    bg: 'bg-white',
    border: 'border-purple-200/80',
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    valueText: 'text-purple-900',
  },
  sky: {
    bg: 'bg-white',
    border: 'border-sky-200/80',
    iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/60',
    valueText: 'text-sky-900',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend,
  onClick,
}) => {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${styles.border} rounded-3xl p-5 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-[#2563eb]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-extrabold text-[#434655] uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${styles.iconBg} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl lg:text-3xl font-extrabold ${styles.valueText}`}>{value}</h3>
        {trend && (
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#ededf9] text-[#2563eb]">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs font-semibold text-[#434655] mt-1.5">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
