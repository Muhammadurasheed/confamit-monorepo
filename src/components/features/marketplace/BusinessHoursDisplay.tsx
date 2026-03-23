import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isBusinessOpen } from "@/services/marketplace";
import type { BusinessHours } from "@/types";

interface BusinessHoursDisplayProps {
  hours: {
    monday?: BusinessHours | null;
    tuesday?: BusinessHours | null;
    wednesday?: BusinessHours | null;
    thursday?: BusinessHours | null;
    friday?: BusinessHours | null;
    saturday?: BusinessHours | null;
    sunday?: BusinessHours | null;
  };
}

const BusinessHoursDisplay = ({ hours }: BusinessHoursDisplayProps) => {
  const isOpen = isBusinessOpen(hours);
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const now = new Date();
  const today = dayNames[now.getDay() === 0 ? 6 : now.getDay() - 1];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Open/Closed Status */}
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-lg">Business Hours</h3>
        <Badge
          variant={isOpen ? "default" : "secondary"}
          className={isOpen ? "bg-success text-success-foreground" : ""}
        >
          {isOpen ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Open Now
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Closed
            </>
          )}
        </Badge>
      </div>

      {/* Hours Table */}
      <div className="space-y-2">
        {dayNames.map((day) => {
          const dayHours = hours[day as keyof typeof hours];
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`flex justify-between py-2 px-3 rounded-md ${
                isToday ? 'bg-primary/10 font-medium' : 'bg-muted/50'
              }`}
            >
              <span className="capitalize">{day}</span>
              <span>
                {dayHours ? (
                  <>
                    {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                  </>
                ) : (
                  <span className="text-muted-foreground">Closed</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHoursDisplay;
