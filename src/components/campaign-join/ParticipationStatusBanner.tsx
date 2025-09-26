import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Upload, 
  Eye, 
  DollarSign, 
  AlertCircle,
  UserCheck
} from "lucide-react";

interface ParticipationStatusBannerProps {
  hasJoined: boolean;
  participation?: {
    status: string;
    created_at: string;
    payout_claimed: boolean;
    payout_amount: number;
  };
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Under Review",
    description: "Your submission is being reviewed",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    progress: 25
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    description: "Your content is live and earning",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200", 
    progress: 75
  },
  live: {
    icon: Eye,
    label: "Live & Earning",
    description: "Content is active and generating revenue",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    progress: 100
  },
  rejected: {
    icon: AlertCircle,
    label: "Rejected",
    description: "Submission needs updates",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    progress: 0
  }
};

export default function ParticipationStatusBanner({ hasJoined, participation }: ParticipationStatusBannerProps) {
  if (!hasJoined) {
    return (
      <Card className="bg-secondary/20 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Ready to Join?</h3>
              <p className="text-sm text-muted-foreground">
                Submit your content below to start earning from this campaign
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = participation?.status || 'pending';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;
  const joinedDate = new Date(participation?.created_at || Date.now()).toLocaleDateString();

  return (
    <Card className={`${config.bgColor} border-2`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-white shadow-sm`}>
                <StatusIcon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">You've joined this campaign</span>
                </div>
                <p className="text-xs text-muted-foreground">Joined on {joinedDate}</p>
              </div>
            </div>
            <Badge variant="outline" className={`${config.color} border-current`}>
              {config.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{config.progress}% Complete</span>
            </div>
            <Progress value={config.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>

          {/* Journey Steps */}
          <div className="flex items-center justify-between pt-2">
            {[
              { step: "Joined", complete: true },
              { step: "Submitted", complete: true },
              { step: "Approved", complete: status === 'approved' || status === 'live' },
              { step: "Live", complete: status === 'live' },
              { step: "Paid", complete: participation?.payout_claimed }
            ].map((step, index) => (
              <div key={step.step} className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${
                  step.complete 
                    ? 'bg-green-500' 
                    : index === Object.values(statusConfig).findIndex(s => s.progress === config.progress) 
                      ? `${config.color.replace('text-', 'bg-').replace('-600', '-500')}` 
                      : 'bg-gray-300'
                }`} />
                <span className="text-xs text-muted-foreground">{step.step}</span>
              </div>
            ))}
          </div>

          {/* Payout Status */}
          {participation?.payout_claimed && (
            <div className="flex items-center gap-2 pt-2 border-t border-green-200">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Earned ${participation.payout_amount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}