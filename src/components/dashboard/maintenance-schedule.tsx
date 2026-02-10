import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Plane } from '@/lib/types';

type MaintenanceScheduleProps = {
  data: Plane[];
};

export function MaintenanceSchedule({ data }: MaintenanceScheduleProps) {
  return (
    <div className="space-y-4">
      {data.map((plane) => {
        const progress = (plane.totalHours / plane.nextMaintenanceHours) * 100;
        const hoursRemaining = plane.nextMaintenanceHours - plane.totalHours;
        return (
          <div key={plane.id}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{plane.name} ({plane.id})</span>
              <span className="text-muted-foreground">{hoursRemaining.toFixed(1)} hrs remaining</span>
            </div>
            <Progress value={progress} aria-label={`${progress.toFixed(0)}% until maintenance`} />
          </div>
        );
      })}
    </div>
  );
}
