'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  debounceMs?: number
  onSearch: (query: string) => void
  onClear?: () => void
  className?: string
  disabled?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  defaultValue = "",
  debounceMs = 300,
  onSearch,
  onClear,
  className,
  disabled = false
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsSearching(true)
      onSearch(searchQuery)
      setIsSearching(false)
    }, debounceMs),
    [onSearch, debounceMs]
  )

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(query)
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [query, debouncedSearch])

  // Update local state if defaultValue changes externally
  useEffect(() => {
    if (defaultValue !== query) {
      setQuery(defaultValue)
    }
  }, [defaultValue]) // Remove query from deps to avoid infinite loop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleClear = () => {
    setQuery("")
    if (onClear) {
      onClear()
    } else {
      onSearch("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            isSearching ? "text-primary animate-pulse" : "text-muted-foreground"
          )} 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Custom debounce function with cancel support
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }) as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

// Hook version for more complex search scenarios
export function useSearchDebounce(
  initialQuery: string = "",
  debounceMs: number = 300
) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setIsSearching(false)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [query, debounceMs])

  const clearSearch = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
  }, [])

  return {
    query,
    debouncedQuery,
    isSearching,
    setQuery,
    clearSearch
  }
}