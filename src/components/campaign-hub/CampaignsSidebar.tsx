import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Music, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Hash,
  Instagram,
  Youtube,
  Play
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CampaignsSidebarProps {
  campaignCounts: {
    total: number
    byGenre: Record<string, number>
    byPlatform: Record<string, number>
    byPayoutType: Record<string, number>
  }
  onFilterChange: (filters: CampaignFilters) => void
  currentFilters: CampaignFilters
}

export interface CampaignFilters {
  genre?: string
  platform?: string
  payoutType?: string
  search?: string
}

const genres = [
  { id: "hip-hop", name: "Hip-Hop", icon: Hash },
  { id: "pop", name: "Pop", icon: TrendingUp },
  { id: "rock", name: "Rock", icon: Music },
  { id: "r&b", name: "R&B", icon: Music },
  { id: "electronic", name: "Electronic", icon: Play },
  { id: "country", name: "Country", icon: Music },
]

const platforms = [
  { id: "tiktok", name: "TikTok", icon: Hash },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "youtube", name: "YouTube", icon: Youtube },
]

const payoutTypes = [
  { id: "fixed", name: "Fixed Rate", icon: DollarSign },
  { id: "performance", name: "Performance", icon: TrendingUp },
]

export function CampaignsSidebar({ campaignCounts, onFilterChange, currentFilters }: CampaignsSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || "")

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange({ ...currentFilters, search: value })
  }

  const handleFilterClick = (filterType: keyof CampaignFilters, value?: string) => {
    const newFilters = { ...currentFilters }
    
    if (newFilters[filterType] === value) {
      // If clicking the same filter, remove it
      delete newFilters[filterType]
    } else {
      // Set new filter value
      if (value) {
        newFilters[filterType] = value
      }
    }
    
    onFilterChange(newFilters)
  }

  const isFilterActive = (filterType: keyof CampaignFilters, value: string) => {
    return currentFilters[filterType] === value
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="pt-4">
        {/* Search */}
        {!collapsed && (
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* All Campaigns */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={Object.keys(currentFilters).length === 0 || (Object.keys(currentFilters).length === 1 && !!currentFilters.search)}
                  onClick={() => onFilterChange({ search: currentFilters.search })}
                >
                  <Music className="mr-2 h-4 w-4" />
                  {!collapsed && (
                    <>
                      <span>All Campaigns</span>
                      <Badge variant="secondary" className="ml-auto">
                        {campaignCounts.total}
                      </Badge>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Genre Filters */}
        <SidebarGroup>
          <SidebarGroupLabel>By Genre</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {genres.map((genre) => {
                const count = campaignCounts.byGenre[genre.id] || 0
                if (count === 0 && !collapsed) return null
                
                return (
                  <SidebarMenuItem key={genre.id}>
                    <SidebarMenuButton 
                      isActive={isFilterActive('genre', genre.id)}
                      onClick={() => handleFilterClick('genre', genre.id)}
                    >
                      <genre.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>{genre.name}</span>
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {count}
                            </Badge>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Platform Filters */}
        <SidebarGroup>
          <SidebarGroupLabel>By Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platforms.map((platform) => {
                const count = campaignCounts.byPlatform[platform.id] || 0
                if (count === 0 && !collapsed) return null
                
                return (
                  <SidebarMenuItem key={platform.id}>
                    <SidebarMenuButton 
                      isActive={isFilterActive('platform', platform.id)}
                      onClick={() => handleFilterClick('platform', platform.id)}
                    >
                      <platform.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>{platform.name}</span>
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {count}
                            </Badge>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Payout Type Filters */}
        <SidebarGroup>
          <SidebarGroupLabel>By Payout</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {payoutTypes.map((payoutType) => {
                const count = campaignCounts.byPayoutType[payoutType.id] || 0
                if (count === 0 && !collapsed) return null
                
                return (
                  <SidebarMenuItem key={payoutType.id}>
                    <SidebarMenuButton 
                      isActive={isFilterActive('payoutType', payoutType.id)}
                      onClick={() => handleFilterClick('payoutType', payoutType.id)}
                    >
                      <payoutType.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>{payoutType.name}</span>
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {count}
                            </Badge>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}