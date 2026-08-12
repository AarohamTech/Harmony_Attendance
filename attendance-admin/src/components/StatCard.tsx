import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'sky';
  subtitle?: string;
  trend?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-600 text-white',
    valueText: 'text-blue-950',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    valueText: 'text-emerald-950',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-600 text-white',
    valueText: 'text-amber-950',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600 text-white',
    valueText: 'text-rose-950',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    valueText: 'text-indigo-950',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600 text-white',
    valueText: 'text-purple-950',
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    iconBg: 'bg-sky-600 text-white',
    valueText: 'text-sky-950',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend,
}) => {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white border ${styles.border} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl font-bold ${styles.valueText}`}>{value}</h3>
        {trend && <span className="text-xs font-medium text-slate-500">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
