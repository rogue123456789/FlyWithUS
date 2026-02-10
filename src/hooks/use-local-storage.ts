'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after the component has mounted on the client.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When mounted, try to load the value from localStorage.
  useEffect(() => {
    if (isMounted) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
      }
    }
    // `key` is a dependency, so if it changes, we reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // When the value changes, and we are mounted, save it to localStorage.
  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, value, isMounted]);

  return [value, setValue];
}
