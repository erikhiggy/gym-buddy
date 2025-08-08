'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Dumbbell, 
  Plus, 
  Calendar, 
  User
} from 'lucide-react'

const navigationItems = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    description: 'Dashboard'
  },
  { 
    name: 'Workouts', 
    href: '/workouts', 
    icon: Dumbbell,
    description: 'Browse workouts'
  },
  { 
    name: 'Add', 
    href: '/workouts/new', 
    icon: Plus,
    description: 'Create workout',
    isSpecial: true // This will get special styling
  },
  { 
    name: 'History', 
    href: '/history', 
    icon: Calendar,
    description: 'Workout history'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User,
    description: 'Your profile'
  },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "fixed bottom-0 left-0 right-0 z-50",
      className
    )}>
      <div className="flex justify-around items-center py-2 px-2 max-w-screen-2xl mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href} className="flex-1 max-w-[80px]">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col h-auto py-2 px-2 gap-1 w-full relative",
                  "transition-all duration-200",
                  "hover:bg-transparent",
                  item.isSpecial && [
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "shadow-md hover:shadow-lg",
                    "scale-110",
                    "rounded-full",
                    "mx-2"
                  ],
                  isActive && !item.isSpecial && [
                    "text-primary",
                    "bg-primary/10"
                  ],
                  !isActive && !item.isSpecial && [
                    "text-muted-foreground",
                    "hover:text-foreground"
                  ]
                )}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  item.isSpecial ? "h-6 w-6" : "h-5 w-5",
                  isActive && !item.isSpecial && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium transition-all duration-200",
                  item.isSpecial && "text-primary-foreground",
                  isActive && !item.isSpecial && "font-semibold"
                )}>
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {isActive && !item.isSpecial && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Alternative version with progress indicator
export function MobileNavWithProgress({ 
  className,
  todayProgress 
}: { 
  className?: string
  todayProgress?: {
    completed: number
    total: number
  }
}) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "fixed bottom-0 left-0 right-0 z-50",
      className
    )}>
      {/* Progress bar */}
      {todayProgress && todayProgress.total > 0 && (
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${Math.round((todayProgress.completed / todayProgress.total) * 100)}%` 
            }}
          />
        </div>
      )}
      
      <div className="flex justify-around items-center py-2 px-2 max-w-screen-2xl mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href} className="flex-1 max-w-[80px]">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col h-auto py-2 px-2 gap-1 w-full relative",
                  "transition-all duration-200",
                  "hover:bg-transparent",
                  item.isSpecial && [
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "shadow-md hover:shadow-lg",
                    "scale-110",
                    "rounded-full",
                    "mx-2"
                  ],
                  isActive && !item.isSpecial && [
                    "text-primary",
                    "bg-primary/10"
                  ],
                  !isActive && !item.isSpecial && [
                    "text-muted-foreground",
                    "hover:text-foreground"
                  ]
                )}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  item.isSpecial ? "h-6 w-6" : "h-5 w-5",
                  isActive && !item.isSpecial && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium transition-all duration-200",
                  item.isSpecial && "text-primary-foreground",
                  isActive && !item.isSpecial && "font-semibold"
                )}>
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {isActive && !item.isSpecial && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Hook to get navigation context
export function useNavigation() {
  const pathname = usePathname()
  
  const currentItem = navigationItems.find(item => item.href === pathname)
  const isOnSpecialRoute = currentItem?.isSpecial || false
  
  return {
    currentPath: pathname,
    currentItem,
    isOnSpecialRoute,
    navigationItems
  }
}