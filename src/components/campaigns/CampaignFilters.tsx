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
  rewardRange: [number, number];
  location: string | null;
  genres: string[];
}

interface CampaignFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  maxPayout: number;
  availableGenres: string[];
  availableLocations: string[];
  className?: string;
}

export function CampaignFilters({
  filters,
  onFiltersChange,
  maxPayout,
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

  const handleReset = () => {
    onFiltersChange({
      campaignTypes: [],
      userTypes: [],
      rewardRange: [0, maxPayout],
      location: null,
      genres: [],
    });
  };

  const hasActiveFilters = 
    filters.campaignTypes.length > 0 ||
    filters.userTypes.length > 0 ||
    filters.genres.length > 0 ||
    filters.location !== null ||
    filters.rewardRange[0] > 0 ||
    filters.rewardRange[1] < maxPayout;

  const activeFilterCount = 
    filters.campaignTypes.length +
    filters.userTypes.length +
    filters.genres.length +
    (filters.location ? 1 : 0) +
    (filters.rewardRange[0] > 0 || filters.rewardRange[1] < maxPayout ? 1 : 0);

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

            {/* Reward Range Filter */}
            <div className="space-y-3">
              <Label>Reward Range</Label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={maxPayout}
                  step={0.01}
                  value={filters.rewardRange}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, rewardRange: value as [number, number] })
                  }
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.rewardRange[0].toFixed(2)}</span>
                <span>${filters.rewardRange[1].toFixed(2)}</span>
              </div>
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
