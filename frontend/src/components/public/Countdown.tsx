import { useEffect, useRef, useState } from "react";

const calculateRemainingTime = (targetDate: Date) => {
  const currentTime = new Date().getTime();
  const remainingTime = targetDate.getTime() - currentTime;

  const seconds = Math.floor(remainingTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days: days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
};

export default function Countdown() {
  const targetDateRef = useRef<Date>(new Date("March 11, 2024 22:00:00 UTC"));
  const [count, setCount] = useState(
    calculateRemainingTime(targetDateRef.current),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(calculateRemainingTime(targetDateRef.current));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0D1A29] text-xl text-white">
      <h1 className="countdown flex gap-4">
        <div className="w-7 text-center" suppressHydrationWarning>
          {count.days}
          <br />D
        </div>
        <div className="w-7 text-center" suppressHydrationWarning>
          {count.hours}
          <br />H
        </div>
        <div className="w-7 text-center" suppressHydrationWarning>
          {count.minutes}
          <br />M
        </div>
        <div className="w-7 text-center" suppressHydrationWarning>
          {count.seconds}
          <br />S
        </div>
      </h1>
    </div>
  );
}
