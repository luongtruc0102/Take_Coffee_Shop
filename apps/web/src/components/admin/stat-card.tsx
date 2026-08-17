import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#78866B]">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[#1F1B18]">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3E9DE] text-[#4A2C20]">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm text-[#8A817B]">
          {description}
        </p>
      )}
    </div>
  );
}