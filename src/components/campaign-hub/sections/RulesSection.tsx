import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Campaign {
  instructions?: string;
  rules?: string;
  platforms: string[];
}

interface RulesSectionProps {
  campaign: Campaign;
}

const defaultRules = [
  {
    title: "Content Guidelines",
    rules: [
      "Content must be original and not copied from other creators",
      "No explicit, violent, or inappropriate content allowed",
      "Must comply with platform community guidelines",
      "Content should be high quality and engaging"
    ]
  },
  {
    title: "Submission Requirements", 
    rules: [
      "Submit only content posted within the campaign period",
      "Include the required hashtags and mentions",
      "Video quality must be 720p or higher",
      "Audio must be clear and audible"
    ]
  },
  {
    title: "Payout Terms",
    rules: [
      "Earnings are calculated based on verified metrics",
      "Payouts are processed within 30 days of campaign end",
      "Must maintain content live for minimum 30 days",
      "False metrics or bot engagement will result in disqualification"
    ]
  }
];

const platformSpecificRules: Record<string, string[]> = {
  tiktok: [
    "Videos must be between 15-60 seconds",
    "Use trending sounds when possible", 
    "Include campaign hashtag in caption",
    "Tag the artist's TikTok account"
  ],
  youtube: [
    "Videos must be at least 30 seconds long",
    "Include artist credit in description",
    "Use campaign hashtag in title or description",
    "Enable monetization if eligible"
  ],
  instagram: [
    "Posts can be photos, videos, or stories",
    "Stories must be saved as highlights",
    "Use all required hashtags",
    "Tag the artist's Instagram account"
  ]
};

export function RulesSection({ campaign }: RulesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please read all rules carefully. Failure to follow these guidelines may result in 
          submission rejection or disqualification from the campaign.
        </AlertDescription>
      </Alert>

      {/* Campaign Specific Instructions */}
      {campaign.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Artist Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{campaign.instructions}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Specific Rules */}
      {campaign.rules && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Campaign Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{campaign.rules}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Default Platform Rules */}
      <Card>
        <CardHeader>
          <CardTitle>General Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {defaultRules.map((section, index) => (
              <AccordionItem key={index} value={`default-${index}`}>
                <AccordionTrigger className="text-left">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {section.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Platform Specific Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Specific Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {campaign.platforms.map((platform) => {
              const rules = platformSpecificRules[platform];
              if (!rules) return null;
              
              return (
                <AccordionItem key={platform} value={platform}>
                  <AccordionTrigger className="text-left capitalize">
                    {platform} Requirements
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {rules.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}