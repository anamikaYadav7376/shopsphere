import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of inactivity.  Any time `value` changes the timer resets; the debounced
 * value is only committed once the caller stops changing it.
 *
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} [delay=400] - Debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the previous timer if value changes before delay elapses.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
