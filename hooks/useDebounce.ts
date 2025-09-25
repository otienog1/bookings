import { useState, useEffect } from 'react'

/**
 * Custom hook that debounces a value by the specified delay
 * Useful for search inputs, API calls, etc.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if value or delay changes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debounced search functionality
 * Provides both immediate and debounced values plus loading state
 *
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with search value, debounced value, setter, and loading state
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const debouncedValue = useDebounce(searchValue, delay)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Set searching state when searchValue changes
    if (searchValue !== debouncedValue) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchValue, debouncedValue])

  return {
    searchValue,
    debouncedValue,
    setSearchValue,
    isSearching,
    clearSearch: () => setSearchValue('')
  }
}