import { 
  FileText, 
  Gift, 
  MessageSquare, 
  Upload, 
  Activity,
  BarChart3,
  Badge,
  Lock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { CampaignSectionType } from "./CampaignHubLayout";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  platforms: string[];
  budget?: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  instructions?: string;
  rules?: string;
  genre?: string;
  status?: string;
}

interface Participation {
  status: string;
}

interface CampaignSidebarProps {
  activeSection: CampaignSectionType;
  onSectionChange: (section: CampaignSectionType) => void;
  campaign: Campaign;
  participation?: Participation;
}

const sidebarItems = [
  {
    id: "overview" as CampaignSectionType,
    title: "Campaign Overview",
    icon: BarChart3,
    description: "Details & stats"
  },
  {
    id: "rules" as CampaignSectionType,
    title: "Rules & Regulations", 
    icon: FileText,
    description: "Guidelines to follow"
  },
  {
    id: "submissions" as CampaignSectionType,
    title: "Submissions",
    icon: Upload,
    description: "Upload & manage content"
  },
  {
    id: "communication" as CampaignSectionType,
    title: "Chat",
    icon: MessageSquare,
    description: "Talk with artist"
  },
  {
    id: "updates" as CampaignSectionType,
    title: "Updates & Timeline",
    icon: Activity,
    description: "Campaign activity"
  },
  {
    id: "rewards" as CampaignSectionType,
    title: "Rewards & Leaderboard",
    icon: Badge,
    description: "Leaderboard & earnings"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "approved": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "live": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "paid_out": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export function CampaignSidebar({ 
  activeSection, 
  onSectionChange, 
  campaign,
  participation 
}: CampaignSidebarProps) {
  return (
    <Sidebar className="w-80 border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={campaign.cover_art_url} alt={campaign.title} />
            <AvatarFallback className="rounded-lg">
              {campaign.title.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{campaign.title}</h2>
            <p className="text-xs text-muted-foreground truncate">{campaign.song_title}</p>
            <div className="flex items-center gap-2 mt-2">
              {campaign.genre && (
                <BadgeComponent variant="secondary" className="text-xs">
                  {campaign.genre}
                </BadgeComponent>
              )}
              {participation && (
                <BadgeComponent 
                  variant="outline" 
                  className={`text-xs capitalize ${getStatusColor(participation.status)}`}
                >
                  {participation.status}
                </BadgeComponent>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isLocked = !participation && ["submissions", "communication", "updates", "rewards"].includes(item.id);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => !isLocked && onSectionChange(item.id)}
                      isActive={isActive && !isLocked}
                      disabled={isLocked}
                      className={`h-auto p-3 flex-col items-start gap-1 ${
                        isLocked ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {isLocked && <Lock className="h-3 w-3 shrink-0" />}
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground text-left">
                        {isLocked ? "Join campaign to unlock" : item.description}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}