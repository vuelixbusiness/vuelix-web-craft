import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { CAMPAIGN_TYPES } from "@/config/campaignTypes";
import { USER_TYPES } from "@/config/userTypes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface FilterState {
  campaignTypes: string[];
  userTypes: string[];
  rewardTypes: string[];
  location: string | null;
  genres: string[];
}

interface CampaignFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableGenres: string[];
  availableLocations: string[];
  className?: string;
}

export function CampaignFilters({
  filters,
  onFiltersChange,
  availableGenres,
  availableLocations,
  className,
}: CampaignFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);

  const campaignTypeOptions: MultiSelectOption[] = CAMPAIGN_TYPES.map(type => ({
    value: type.id,
    label: type.label,
    icon: type.icon,
  }));

  const userTypeOptions: MultiSelectOption[] = USER_TYPES.map(type => ({
    value: type.id,
    label: type.label,
    icon: type.icon,
  }));

  const genreOptions: MultiSelectOption[] = availableGenres.map(genre => ({
    value: genre,
    label: genre.charAt(0).toUpperCase() + genre.slice(1),
  }));

  const rewardTypeOptions: MultiSelectOption[] = [
    {
      value: 'per-view',
      label: 'Performance Based',
      icon: '📊',
    },
    {
      value: 'fixed_rate',
      label: 'Fixed Rate',
      icon: '💵',
    },
    {
      value: 'hybrid',
      label: 'Hybrid',
      icon: '🔄',
    },
  ];

  const handleReset = () => {
    onFiltersChange({
      campaignTypes: [],
      userTypes: [],
      rewardTypes: [],
      location: null,
      genres: [],
    });
  };

  const hasActiveFilters = 
    filters.campaignTypes.length > 0 ||
    filters.userTypes.length > 0 ||
    filters.genres.length > 0 ||
    filters.location !== null ||
    filters.rewardTypes.length > 0;

  const activeFilterCount = 
    filters.campaignTypes.length +
    filters.userTypes.length +
    filters.genres.length +
    (filters.location ? 1 : 0) +
    (filters.rewardTypes.length > 0 ? 1 : 0);

  return (
    <Card className={cn("bg-card border-border", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Filters</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Campaign Type Filter */}
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <MultiSelect
                options={campaignTypeOptions}
                selected={filters.campaignTypes}
                onChange={(selected) =>
                  onFiltersChange({ ...filters, campaignTypes: selected })
                }
                placeholder="All campaign types"
              />
            </div>

            {/* Creator Type Filter */}
            <div className="space-y-2">
              <Label>Artist Type</Label>
              <MultiSelect
                options={userTypeOptions}
                selected={filters.userTypes}
                onChange={(selected) =>
                  onFiltersChange({ ...filters, userTypes: selected })
                }
                placeholder="All artist types"
              />
            </div>

            {/* Reward Type Filter */}
            <div className="space-y-2">
              <Label>Reward</Label>
              <MultiSelect
                options={rewardTypeOptions}
                selected={filters.rewardTypes}
                onChange={(selected) =>
                  onFiltersChange({ ...filters, rewardTypes: selected })
                }
                placeholder="All reward types"
              />
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={filters.location || "all"}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, location: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All locations</SelectItem>
                  {availableLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2">
              <Label>Genre</Label>
              <MultiSelect
                options={genreOptions}
                selected={filters.genres}
                onChange={(selected) =>
                  onFiltersChange({ ...filters, genres: selected })
                }
                placeholder="All genres"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState, value?: string) => void;
  availableGenres: string[];
  availableLocations: string[];
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  availableGenres,
  availableLocations,
}: ActiveFiltersProps) {
  const activeFilters: { type: keyof FilterState; value: string; label: string }[] = [];

  // Campaign types
  filters.campaignTypes.forEach((type) => {
    const campaignType = CAMPAIGN_TYPES.find(ct => ct.id === type);
    if (campaignType) {
      activeFilters.push({
        type: 'campaignTypes',
        value: type,
        label: `${campaignType.icon} ${campaignType.label}`,
      });
    }
  });

  // User types
  filters.userTypes.forEach((type) => {
    const userType = USER_TYPES.find(ut => ut.id === type);
    if (userType) {
      activeFilters.push({
        type: 'userTypes',
        value: type,
        label: `${userType.icon} ${userType.label}`,
      });
    }
  });

  // Genres
  filters.genres.forEach((genre) => {
    activeFilters.push({
      type: 'genres',
      value: genre,
      label: genre.charAt(0).toUpperCase() + genre.slice(1),
    });
  });

  // Reward Types
  filters.rewardTypes.forEach((type) => {
    const rewardType = [
      { value: 'per-view', label: 'Performance Based', icon: '📊' },
      { value: 'fixed_rate', label: 'Fixed Rate', icon: '💵' },
      { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
    ].find(opt => opt.value === type);
    if (rewardType) {
      activeFilters.push({
        type: 'rewardTypes',
        value: type,
        label: `${rewardType.icon} ${rewardType.label}`,
      });
    }
  });

  // Location
  if (filters.location) {
    activeFilters.push({
      type: 'location',
      value: filters.location,
      label: `📍 ${filters.location}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="ml-1 rounded-full hover:bg-muted p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
