import { ReactNode } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CampaignsSidebar, CampaignFilters } from "./CampaignsSidebar"

interface CampaignsLayoutProps {
  children: ReactNode
  campaignCounts: {
    total: number
    byGenre: Record<string, number>
    byPlatform: Record<string, number>
    byPayoutType: Record<string, number>
  }
  onFilterChange: (filters: CampaignFilters) => void
  currentFilters: CampaignFilters
}

export function CampaignsLayout({ 
  children, 
  campaignCounts, 
  onFilterChange, 
  currentFilters 
}: CampaignsLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Global header with sidebar trigger */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center">
          <SidebarTrigger className="ml-4" />
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-foreground">Campaigns</h1>
          </div>
        </header>

        {/* Sidebar */}
        <CampaignsSidebar 
          campaignCounts={campaignCounts}
          onFilterChange={onFilterChange}
          currentFilters={currentFilters}
        />

        {/* Main content area */}
        <main className="flex-1 pt-14 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}