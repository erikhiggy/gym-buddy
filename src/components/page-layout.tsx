import { Navigation } from '@/components/navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center px-4">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main className="flex-1 pb-20">
        <div className="container max-w-screen-2xl px-4 py-4">
          {children}
        </div>
      </main>
      
      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  )
}