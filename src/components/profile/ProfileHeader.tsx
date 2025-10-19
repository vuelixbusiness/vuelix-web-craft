import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Link as LinkIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useBannerUpload } from "@/hooks/useBannerUpload";
import { useNavigate } from "react-router-dom";
import { getUserTypeById } from "@/config/userTypes";
import { LocationPopover } from "./LocationPopover";

interface ProfileHeaderProps {
  onEditProfile: () => void;
  isPublicVisible: boolean;
  onToggleVisibility: () => void;
}

export function ProfileHeader({ onEditProfile, isPublicVisible, onToggleVisibility }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { triggerFileInput: triggerAvatarInput, isUploading: isUploadingAvatar } = useAvatarUpload();
  const { triggerFileInput: triggerBannerInput, isUploading: isUploadingBanner } = useBannerUpload();
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-primary rounded-xl overflow-hidden mb-6">
        {user?.banner_url ? (
          <img src={user.banner_url} alt="Profile banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-hero" />
        )}
      </div>

      {/* Change Banner Button */}
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-4 right-4 z-10"
        onClick={triggerBannerInput}
        disabled={isUploadingBanner}
      >
        <Camera className="w-4 h-4 mr-2" />
        Change Banner
      </Button>

      {/* Profile Info */}
      <div className="relative px-6 pb-6 z-20 bg-card rounded-lg shadow-elegant">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4 md:mb-0">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background shadow-elegant">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-3xl">
                  {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 shadow-soft"
                onClick={triggerAvatarInput}
                disabled={isUploadingAvatar}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                <p className="text-muted-foreground">@{user?.username}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.membershipType === 'premium' && (
                  <Badge variant="default">
                    Premium Member
                  </Badge>
                )}
                {user?.type && (
                <Badge className="bg-primary/20 hover:bg-primary/30 border-primary/30">
                  {getUserTypeById(user.type)?.label || user.type}
                </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleVisibility}
            >
              {isPublicVisible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {isPublicVisible ? 'Public' : 'Private'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/user/${user?.username}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
            <Button size="sm" onClick={onEditProfile}>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio & Location */}
        <div className="mt-6 space-y-3">
          {user?.bio && (
            <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {user?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user?.portfolio_links && Array.isArray(user.portfolio_links) && user.portfolio_links.length > 0 && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href={user.portfolio_links[0] as string} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-smooth"
                >
                  Portfolio
                </a>
              </div>
            )}
          </div>
          
          {/* Location Selector */}
          <div className="pt-2">
            <LocationPopover />
          </div>
        </div>
      </div>
    </div>
  );
}
