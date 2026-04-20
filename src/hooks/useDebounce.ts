import { useState, useEffect } from "react";

/**
 * Delays updating the returned value until `delay` ms have passed
 * without the input changing. Cleans up the timer on unmount.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}