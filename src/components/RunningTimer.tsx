import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface RunningTimerProps {
  startTime: string; // ISO timestamp when submission was approved
  status: string;
  className?: string;
}

const RunningTimer = ({ startTime, status, className = "" }: RunningTimerProps) => {
  const [timeElapsed, setTimeElapsed] = useState("");

  useEffect(() => {
    if (status !== "approved") return;

    const updateTimer = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      if (diff < 0) {
        setTimeElapsed("--");
        return;
      }

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        setTimeElapsed(`${days}d ${remainingHours}h ${remainingMinutes}m`);
      } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;
        setTimeElapsed(`${hours}h ${remainingMinutes}m ${remainingSeconds}s`);
      } else if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        setTimeElapsed(`${minutes}m ${remainingSeconds}s`);
      } else {
        setTimeElapsed(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  if (status !== "approved") {
    return (
      <div className={`flex items-center space-x-1 text-yellow-600 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-xs font-medium">Pending approval</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 text-green-600 ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="text-xs font-medium">{timeElapsed}</span>
    </div>
  );
};

export default RunningTimer;