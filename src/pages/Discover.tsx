import { Suspense } from "react";
import { Globe } from "lucide-react";
import { DiscoveryGlobe } from "@/components/DiscoveryGlobe";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";

const Discover = () => {
  return (
    <DashboardLayout>
      <div className="relative min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-800 overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-300/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Globe className="w-10 h-10 text-primary animate-pulse" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Discover
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore music campaigns from creators around the world. Each point represents an active campaign waiting for talented artists like you.
            </p>
          </div>

          {/* Globe Container */}
          <div className="relative rounded-2xl border border-primary/20 bg-background/5 backdrop-blur-sm p-6 shadow-2xl shadow-primary/10">
            <Suspense fallback={
              <Skeleton className="w-full h-[500px] lg:h-[700px] bg-muted/20" />
            }>
              <div className="h-[500px] lg:h-[700px]">
                <DiscoveryGlobe />
              </div>
            </Suspense>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">300+ Campaigns</h3>
              <p className="text-sm text-muted-foreground">Active campaigns across the globe</p>
            </div>
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">Connect with creators worldwide</p>
            </div>
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">See new campaigns as they launch</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Discover;
