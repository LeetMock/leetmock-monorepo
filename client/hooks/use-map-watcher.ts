import { useEffect, useRef } from "react";

/**
 * A hook that watches for changes in a map object and calls a callback when a value changes.
 *
 * @param map - The object to watch for changes
 * @param callback - Function called when a value changes with (key, newValue) parameters
 *
 * @example
 * ```tsx
 * const state = { count: 1, name: "test" };
 *
 * useMapWatcher(state, (key, value) => {
 *   console.log(`${key} changed to ${value}`);
 * });
 * ```
 *
 * @returns void
 */
export const useMapWatcher = <T extends Record<string, any>>(
  map: T,
  callback: (key: keyof T, value: T[keyof T]) => void
) => {
  const prevMapRef = useRef<Partial<T>>({});

  useEffect(() => {
    Object.keys(map).forEach((key) => {
      if (prevMapRef.current[key] !== map[key]) {
        callback(key, map[key]);
      }
    });

    prevMapRef.current = map;
  }, [map, callback]);
};
