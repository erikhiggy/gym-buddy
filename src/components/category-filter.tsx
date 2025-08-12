'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

// Default workout categories (matches your seeded data)
export const WORKOUT_CATEGORIES = [
  'Strength',
  'Cardio', 
  'Flexibility',
  'HIIT',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Bodyweight'
] as const

export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number]

interface CategoryFilterProps {
  categories?: readonly string[]
  selectedCategory?: string | null
  onCategorySelect: (category: string | null) => void
  showAll?: boolean
  className?: string
}

export function CategoryFilter({
  categories = WORKOUT_CATEGORIES,
  selectedCategory = null,
  onCategorySelect,
  showAll = true,
  className
}: CategoryFilterProps) {
  const handleCategoryClick = (category: string | null) => {
    // If clicking the same category, deselect it
    if (selectedCategory === category) {
      onCategorySelect(null)
    } else {
      onCategorySelect(category)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {/* All categories option */}
          {showAll && (
            <CategoryChip
              label="All"
              isActive={selectedCategory === null}
              onClick={() => handleCategoryClick(null)}
            />
          )}
          
          {/* Individual categories */}
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isActive={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface CategoryChipProps {
  label: string
  isActive: boolean
  onClick: () => void
  className?: string
}

function CategoryChip({ label, isActive, onClick, className }: CategoryChipProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn(
        "cursor-pointer select-none whitespace-nowrap transition-all duration-200",
        "hover:shadow-sm hover:scale-105 active:scale-95",
        "px-3 py-1.5 text-sm",
        !isActive && "hover:bg-secondary/80",
        isActive && "shadow-sm",
        className
      )}
      onClick={onClick}
    >
      {label}
    </Badge>
  )
}

// Hook for managing category filter state
export function useCategoryFilter(initialCategory?: string | null) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  )

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category)
  }

  const clearCategory = () => {
    setSelectedCategory(null)
  }

  return {
    selectedCategory,
    selectCategory,
    clearCategory,
    isFiltered: selectedCategory !== null
  }
}

// Variant with count badges
interface CategoryWithCount {
  name: string
  count: number
}

interface CategoryFilterWithCountsProps {
  categories: CategoryWithCount[]
  selectedCategory?: string | null
  onCategorySelect: (category: string | null) => void
  showAll?: boolean
  totalCount?: number
  className?: string
}

export function CategoryFilterWithCounts({
  categories,
  selectedCategory = null,
  onCategorySelect,
  showAll = true,
  totalCount,
  className
}: CategoryFilterWithCountsProps) {
  const handleCategoryClick = (category: string | null) => {
    if (selectedCategory === category) {
      onCategorySelect(null)
    } else {
      onCategorySelect(category)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {/* All categories option with total count */}
          {showAll && (
            <CategoryChipWithCount
              label="All"
              count={totalCount}
              isActive={selectedCategory === null}
              onClick={() => handleCategoryClick(null)}
            />
          )}
          
          {/* Individual categories with counts */}
          {categories.map((category) => (
            <CategoryChipWithCount
              key={category.name}
              label={category.name}
              count={category.count}
              isActive={selectedCategory === category.name}
              onClick={() => handleCategoryClick(category.name)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface CategoryChipWithCountProps {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
  className?: string
}

function CategoryChipWithCount({ 
  label, 
  count, 
  isActive, 
  onClick, 
  className 
}: CategoryChipWithCountProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn(
        "cursor-pointer select-none whitespace-nowrap transition-all duration-200",
        "hover:shadow-sm hover:scale-105 active:scale-95",
        "px-3 py-1.5 text-sm flex items-center gap-1.5",
        !isActive && "hover:bg-secondary/80",
        isActive && "shadow-sm",
        className
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          isActive 
            ? "bg-primary-foreground/20 text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </Badge>
  )
}