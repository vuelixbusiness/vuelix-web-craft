import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterState } from "./CampaignFilters";

interface SearchWithFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableGenres: string[];
  availableLocations: string[];
  onRemoveFilter: (filterType: keyof FilterState, value?: any) => void;
}

const campaignTypeOptions: MultiSelectOption[] = [
  { value: 'song_content_promotion', label: 'Song/Content Promotion', icon: '🎵' },
  { value: 'collaboration_campaign', label: 'Collaboration', icon: '🤝' },
  { value: 'visual_production', label: 'Production', icon: '🎬' },
  { value: 'brand_partnership', label: 'Brand Partnership', icon: '🏢' },
  { value: 'community_campaign', label: 'Community', icon: '👥' },
  { value: 'performance_live_event', label: 'Live Event / Performance', icon: '🎤' },
];

const userTypeOptions: MultiSelectOption[] = [
  { value: 'artist', label: 'Artist', icon: '🎵' },
  { value: 'creator', label: 'Content Creator', icon: '🎥' },
  { value: 'producer', label: 'Producer', icon: '🎹' },
  { value: 'dj', label: 'DJ', icon: '🎧' },
  { value: 'visual_creative', label: 'Visual Creative', icon: '🖼️' },
  { value: 'record_label', label: 'Record Labels', icon: '💿' },
  { value: 'brand', label: 'Brands', icon: '🏷️' },
  { value: 'studio', label: 'Studios', icon: '🎛️' },
  { value: 'festival_event', label: 'Event Host', icon: '🎤' },
];

const rewardTypeOptions: MultiSelectOption[] = [
  { value: 'per-view', label: 'Performance Based', icon: '📊' },
  { value: 'fixed_rate', label: 'Fixed Rate', icon: '💵' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
];

export function SearchWithFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableGenres,
  availableLocations,
  onRemoveFilter,
}: SearchWithFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const genreOptions: MultiSelectOption[] = availableGenres.map(genre => ({
    value: genre,
    label: genre,
  }));

  const FilterContent = () => (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-6">
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

          {/* Artist Type Filter */}
          <div className="space-y-2">
            <Label>User Type</Label>
            <MultiSelect
              options={userTypeOptions}
              selected={filters.userTypes}
              onChange={(selected) =>
                onFiltersChange({ ...filters, userTypes: selected })
              }
              placeholder="All user types"
            />
          </div>

          {/* Reward Type Filter */}
          <div className="space-y-2">
            <Label>Reward Type</Label>
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
              value={filters.location || undefined}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, location: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
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
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/50">
        <Button className="w-full" onClick={() => setIsOpen(false)}>
          Apply Filters
        </Button>
      </div>
    </>
  );

  return (
    <div className="w-full space-y-3">
      {/* Search Bar with Filter Trigger */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns, artists, songs..."
            className="pl-10"
          />
        </div>

        {/* Filter Trigger */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <FilterContent />
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <FilterContent />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Campaign Types */}
          {filters.campaignTypes.map((type) => {
            const campaignType = campaignTypeOptions.find(opt => opt.value === type);
            return (
              <Badge key={type} variant="secondary" className="gap-1">
                {campaignType?.icon} {campaignType?.label}
                <button
                  onClick={() =>
                    onRemoveFilter('campaignTypes', filters.campaignTypes.filter(t => t !== type))
                  }
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* User Types */}
          {filters.userTypes.map((type) => {
            const userType = userTypeOptions.find(opt => opt.value === type);
            return (
              <Badge key={type} variant="secondary" className="gap-1">
                {userType?.icon} {userType?.label}
                <button
                  onClick={() =>
                    onRemoveFilter('userTypes', filters.userTypes.filter(t => t !== type))
                  }
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* Reward Types */}
          {filters.rewardTypes.map((type) => {
            const rewardType = rewardTypeOptions.find(opt => opt.value === type);
            return (
              <Badge key={type} variant="secondary" className="gap-1">
                {rewardType?.icon} {rewardType?.label}
                <button
                  onClick={() =>
                    onRemoveFilter('rewardTypes', filters.rewardTypes.filter(t => t !== type))
                  }
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* Genres */}
          {filters.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <button
                onClick={() =>
                  onRemoveFilter('genres', filters.genres.filter(g => g !== genre))
                }
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Location */}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              📍 {filters.location}
              <button
                onClick={() => onRemoveFilter('location', null)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
