'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * URL-synced single-value filter state.
 * Replaces useState for filter values that should persist in the URL.
 */
export function useFilterParam(key: string, defaultValue: string): [string, (v: string) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback((newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, newValue);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? '?' + qs : ''}`, { scroll: false });
  }, [searchParams, pathname, router, key, defaultValue]);

  return [value, setValue];
}

/**
 * URL-synced multi-value filter state.
 * For multi-select filters like category arrays.
 */
export function useFilterParamArray(key: string): [string[], (v: string[]) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const value = searchParams.getAll(key);

  const setValue = useCallback((newValues: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    newValues.forEach(v => params.append(key, v));
    const qs = params.toString();
    router.replace(`${pathname}${qs ? '?' + qs : ''}`, { scroll: false });
  }, [searchParams, pathname, router, key]);

  return [value, setValue];
}
