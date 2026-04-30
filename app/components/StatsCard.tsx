interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string; // Tailwind bg class
}

export function StatsCard({ title, value, subtitle, icon, accentColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
      <div
        className={`${accentColor} rounded-xl p-3 shrink-0 text-white`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5 tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
