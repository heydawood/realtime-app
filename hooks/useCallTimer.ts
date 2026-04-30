import { useEffect, useState } from "react";

export const useCallTimer = (startTime: number | null) => {
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);

      const mins = String(Math.floor(diff / 60)).padStart(2, "0");
      const secs = String(diff % 60).padStart(2, "0");

      setTime(`${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return time;
};
