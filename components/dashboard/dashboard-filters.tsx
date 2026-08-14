'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  { value: 'all', label: 'All Months' },
  { value: 'january', label: 'January' },
  { value: 'february', label: 'February' },
  { value: 'march', label: 'March' },
  { value: 'april', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'june', label: 'June' },
  { value: 'july', label: 'July' },
  { value: 'august', label: 'August' },
  { value: 'september', label: 'September' },
  { value: 'october', label: 'October' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' },
];

export function DashboardFilters({ availableYears }: { availableYears: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get('month') || 'all';
  const currentYear = searchParams.get('year') || 'all';

  const selectedMonthLabel = MONTHS.find(m => m.value === currentMonth)?.label || 'All Months';
  const selectedYearLabel = currentYear === 'all' ? 'All Years' : currentYear;

  const updateFilters = (key: 'month' | 'year', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs font-medium text-muted-foreground">Filter:</span>
      <div className="flex">
        <Select
          value={currentMonth}
          onValueChange={(value) => updateFilters('month', value || '')}
        >
          <SelectTrigger className="w-36 rounded-r-none border-r-0 focus:z-10">
            <SelectValue placeholder="Select Month">{selectedMonthLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentYear}
          onValueChange={(value) => updateFilters('year', value || '')}
        >
          <SelectTrigger className="w-28 rounded-l-none focus:z-10">
            <SelectValue placeholder="Select Year">{selectedYearLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
