export interface DashboardGridProps {
  children: React.ReactNode;
}

export interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base sm:text-lg font-bold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}
