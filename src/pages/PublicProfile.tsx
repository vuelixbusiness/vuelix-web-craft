import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, MapPin, Link as LinkIcon, UserPlus, UserCheck, Users, 
  Handshake, Trophy, Star, MessageSquare, Share2, Calendar, Award 
} from "lucide-react";
import { ProfileSocialStats } from "@/components/profile/ProfileSocialStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileCampaigns } from "@/components/profile/ProfileCampaigns";
import { ProfileContentShowcase } from "@/components/profile/ProfileContentShowcase";
import { ProfileSkills } from "@/components/profile/ProfileSkills";

interface ProfileData {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  location: string;
  portfolio_links: any;
  user_type: string;
  membership_type: string;
  engagement_score: number;
  public_visibility: boolean;
  created_at: string;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isPartner, setIsPartner] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    
    // If viewing own profile, redirect to /profile
    if (isOwnProfile) {
      navigate('/profile');
      return;
    }

    fetchProfileData();
  }, [username, currentUser, isOwnProfile]);

  // Check relationships after profile is loaded
  useEffect(() => {
    if (profile && currentUser) {
      checkRelationships();
    }
  }, [profile?.user_id, currentUser?.id]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (!data.public_visibility && data.user_id !== currentUser?.id) {
        toast({
          title: "Profile Private",
          description: "This profile is not public",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRelationships = async () => {
    if (!currentUser || !profile) return;

    try {
      // Check if following
      const { data: followData } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('followed_id', profile.user_id)
        .maybeSingle();

      setIsFollowing(!!followData);

      // Check if friends - properly check both directions
      const { data: friendData } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},addressee_id.eq.${currentUser.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      setIsFriend(!!friendData);

      // Check if partner - properly check both directions
      const { data: partnerData } = await supabase
        .from('user_partnerships')
        .select('id')
        .or(`and(user_id.eq.${currentUser.id},partner_id.eq.${profile.user_id}),and(user_id.eq.${profile.user_id},partner_id.eq.${currentUser.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      setIsPartner(!!partnerData);
    } catch (error) {
      console.error('Error checking relationships:', error);
      toast({
        title: "Warning",
        description: "Could not load relationship status",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followed_id', profile.user_id);
        
        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "Unfollowed successfully" });
      } else {
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUser.id,
            followed_id: profile.user_id,
          });
        
        if (error) throw error;
        setIsFollowing(true);
        toast({ title: "Following successfully" });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handlePartnerRequest = async () => {
    if (!currentUser || !profile) return;

    try {
      const { error } = await supabase
        .from('user_partnerships')
        .insert({
          user_id: currentUser.id,
          partner_id: profile.user_id,
          status: 'pending',
          partnership_type: 'collaboration',
        });

      if (error) throw error;

      toast({
        title: "Partnership Request Sent",
        description: "Your partnership request has been sent",
      });
      setIsPartner(true);
    } catch (error: any) {
      console.error('Error sending partnership request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send partnership request",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${profile?.user_id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Banner */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6 bg-gradient-to-r from-primary/20 to-accent/20">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto -mt-20 md:-mt-24 px-4 mb-8">
          <div className="bg-card rounded-lg shadow-elegant p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-4xl">
                  {profile.display_name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={profile.membership_type === 'premium' ? 'default' : 'secondary'}>
                        {profile.membership_type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {profile.user_type}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentUser && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                      <Button onClick={handleMessage} variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      {!isPartner && (
                        <Button onClick={handlePartnerRequest} variant="outline">
                          <Handshake className="w-4 h-4 mr-2" />
                          Partner Request
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bio & Details */}
                <div className="mt-4 space-y-3">
                  {profile.bio && (
                    <p className="text-foreground">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    )}
                    {profile.engagement_score > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary" />
                        {profile.engagement_score} Engagement Score
                      </div>
                    )}
                  </div>
                  {profile.portfolio_links && Array.isArray(profile.portfolio_links) && profile.portfolio_links.length > 0 && (
                    <div className="flex gap-2">
                      {profile.portfolio_links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {link.label || 'Link'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Stats */}
        <ProfileSocialStats userId={profile.user_id} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="max-w-6xl mx-auto mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <ProfileAchievements userId={profile.user_id} featured />
            <ProfileCampaigns userId={profile.user_id} limit={6} />
            <ProfileContentShowcase userId={profile.user_id} featured />
          </TabsContent>

          <TabsContent value="campaigns">
            <ProfileCampaigns userId={profile.user_id} />
          </TabsContent>

          <TabsContent value="content">
            <ProfileContentShowcase userId={profile.user_id} />
          </TabsContent>

          <TabsContent value="achievements">
            <ProfileAchievements userId={profile.user_id} />
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileSkills userId={profile.user_id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PublicProfile;
