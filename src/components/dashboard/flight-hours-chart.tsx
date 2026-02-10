'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Plane } from '@/lib/types';

type FlightHoursChartProps = {
  data: Plane[];
};

const chartConfig = {
  totalHours: {
    label: 'Total Hours',
    color: 'hsl(var(--chart-1))',
  },
};

export function FlightHoursChart({ data }: FlightHoursChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="totalHours" fill="var(--color-totalHours)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
