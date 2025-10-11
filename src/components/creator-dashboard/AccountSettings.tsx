import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Bell,
  CreditCard,
  Shield,
  Link,
  Settings,
  Camera,
  Save,
  Trash2
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationSelector } from "@/components/LocationSelector";

interface Profile {
  display_name: string;
  username: string;
  bio: string;
  avatar_url?: string;
  city?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface NotificationSettings {
  campaign_alerts: boolean;
  earning_updates: boolean;
  artist_messages: boolean;
  platform_updates: boolean;
  weekly_summary: boolean;
}

interface ContentPreferences {
  preferred_genres: string[];
  preferred_platforms: string[];
  min_payout_rate: number;
  campaign_types: string[];
}

const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { triggerFileInput, isUploading } = useAvatarUpload();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    city: '',
    country: '',
    latitude: null,
    longitude: null
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    campaign_alerts: true,
    earning_updates: true,
    artist_messages: true,
    platform_updates: false,
    weekly_summary: true
  });

  const [preferences, setPreferences] = useState<ContentPreferences>({
    preferred_genres: [],
    preferred_platforms: [],
    min_payout_rate: 0,
    campaign_types: []
  });

  const [connectedPlatforms, setConnectedPlatforms] = useState({
    tiktok: false,
    instagram: false,
    youtube: false
  });

  const availableGenres = [
    'Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Country', 
    'Jazz', 'Reggae', 'Folk', 'Classical', 'Indie', 'Alternative'
  ];

  const campaignTypes = [
    'Music Video', 'Dance Challenge', 'Lip Sync', 'Original Content', 
    'Behind the Scenes', 'Lifestyle', 'Tutorial'
  ];

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          city: data.city || '',
          country: data.country || '',
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    // Validate username before attempting to save
    const usernameError = validateUsername(profile.username);
    if (usernameError) {
      toast({
        title: "Invalid Username",
        description: usernameError,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          city: profile.city,
          country: profile.country,
          latitude: profile.latitude,
          longitude: profile.longitude
        })
        .eq('user_id', user.id);

      if (error) {
        // Handle specific constraint violations
        if (error.message.includes('username_format')) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        if (error.message.includes('username_length')) {
          throw new Error('Username must be between 3 and 20 characters');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotificationSettings = () => {
    // In a real app, this would save to the database
    toast({
      title: "Success",
      description: "Notification preferences saved",
    });
  };

  const saveContentPreferences = () => {
    // In a real app, this would save to the database
    toast({
      title: "Success", 
      description: "Content preferences saved",
    });
  };

  const toggleGenre = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_genres: prev.preferred_genres.includes(genre)
        ? prev.preferred_genres.filter(g => g !== genre)
        : [...prev.preferred_genres, genre]
    }));
  };

  const toggleCampaignType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      campaign_types: prev.campaign_types.includes(type)
        ? prev.campaign_types.filter(t => t !== type)
        : [...prev.campaign_types, type]
    }));
  };

  const togglePlatform = (platform: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_platforms: prev.preferred_platforms.includes(platform)
        ? prev.preferred_platforms.filter(p => p !== platform)
        : [...prev.preferred_platforms, platform]
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {profile.display_name.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a new profile picture (JPG, PNG, or WebP, max 5MB)
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    className={validateUsername(profile.username) ? "border-destructive" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                  {validateUsername(profile.username) && (
                    <p className="text-xs text-destructive">
                      {validateUsername(profile.username)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <LocationSelector
                value={profile.city && profile.country ? `${profile.city}, ${profile.country}` : ''}
                onLocationChange={(location) => 
                  setProfile(prev => ({ 
                    ...prev, 
                    city: location.city, 
                    country: location.country,
                    latitude: location.lat,
                    longitude: location.lng
                  }))
                }
                label="Location"
                placeholder="Select your city"
              />

              <Button onClick={updateProfile} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="w-5 h-5" />
                <span>Connected Platforms</span>
              </CardTitle>
              <CardDescription>Link your social media accounts for automatic tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'tiktok', name: 'TikTok', icon: <FaTiktok className="w-5 h-5" />, color: 'text-pink-500' },
                { key: 'instagram', name: 'Instagram', icon: <FaInstagram className="w-5 h-5" />, color: 'text-purple-500' },
                { key: 'youtube', name: 'YouTube', icon: <FaYoutube className="w-5 h-5" />, color: 'text-red-500' }
              ].map((platform) => (
                <div key={platform.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={platform.color}>
                      {platform.icon}
                    </div>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {connectedPlatforms[platform.key as keyof typeof connectedPlatforms] 
                          ? 'Connected' 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={connectedPlatforms[platform.key as keyof typeof connectedPlatforms] ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => {
                      setConnectedPlatforms(prev => ({
                        ...prev,
                        [platform.key]: !prev[platform.key as keyof typeof prev]
                      }));
                      toast({
                        title: connectedPlatforms[platform.key as keyof typeof connectedPlatforms] ? 'Disconnected' : 'Connected',
                        description: `${platform.name} ${connectedPlatforms[platform.key as keyof typeof connectedPlatforms] ? 'disconnected' : 'connected'} successfully`
                      });
                    }}
                  >
                    {connectedPlatforms[platform.key as keyof typeof connectedPlatforms] ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'campaign_alerts', label: 'New Campaign Alerts', description: 'Get notified when new campaigns match your preferences' },
                { key: 'earning_updates', label: 'Earning Updates', description: 'Notifications about your earnings and payouts' },
                { key: 'artist_messages', label: 'Artist Messages', description: 'Direct messages from artists' },
                { key: 'platform_updates', label: 'Platform Updates', description: 'Updates about new features and changes' },
                { key: 'weekly_summary', label: 'Weekly Summary', description: 'Weekly performance and earnings summary' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={notifications[setting.key as keyof NotificationSettings]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [setting.key]: checked }))
                    }
                  />
                </div>
              ))}
              
              <Button onClick={saveNotificationSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
                <CardDescription>Set your content and campaign preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Genres */}
                <div className="space-y-3">
                  <Label>Preferred Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={preferences.preferred_genres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preferred Platforms */}
                <div className="space-y-3">
                  <Label>Preferred Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {['tiktok', 'instagram', 'youtube'].map((platform) => (
                      <Badge
                        key={platform}
                        variant={preferences.preferred_platforms.includes(platform) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Minimum Payout Rate */}
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout Rate ($)</Label>
                  <Input
                    id="min-payout"
                    type="number"
                    value={preferences.min_payout_rate}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      min_payout_rate: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campaign Types */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Types</CardTitle>
                <CardDescription>Select the types of campaigns you're interested in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {campaignTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={preferences.campaign_types.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCampaignType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                
                <Button onClick={saveContentPreferences} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>Manage your privacy settings and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Earnings</p>
                    <p className="text-sm text-muted-foreground">Display your earnings on your profile</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics Sharing</p>
                    <p className="text-sm text-muted-foreground">Share anonymous analytics to improve the platform</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;