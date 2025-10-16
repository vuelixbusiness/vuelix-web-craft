import { z } from 'zod';

// Support Ticket Validation
export const supportTicketSchema = z.object({
  subject: z.string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .trim()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority' })
  })
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

// Campaign Creation Validation
export const campaignSchema = z.object({
  songTitle: z.string()
    .trim()
    .min(1, 'Song title is required')
    .max(200, 'Song title must be less than 200 characters'),
  
  artistName: z.string()
    .trim()
    .min(1, 'Artist name is required')
    .max(200, 'Artist name must be less than 200 characters'),
  
  genre: z.string()
    .trim()
    .min(1, 'Genre is required')
    .max(100, 'Genre must be less than 100 characters'),
  
  campaignType: z.enum([
    'song_content_promotion',
    'collaboration_campaign', 
    'visual_production',
    'brand_partnership',
    'community_campaign',
    'performance_live_event',
    'visual_services_offering'
  ], {
    errorMap: () => ({ message: 'Please select a valid campaign type' })
  }),
  
  platforms: z.array(z.string())
    .min(1, 'Select at least one platform')
    .max(10, 'Maximum 10 platforms allowed'),
  
  payoutType: z.union([
    z.literal('performance_based'),
    z.literal('fixed_rate'),
    z.literal('hybrid')
  ]).optional().nullable(),
  
  budget: z.number()
    .positive('Budget must be greater than 0')
    .max(10000000, 'Budget cannot exceed $10,000,000')
    .finite('Budget must be a valid number'),
  
  payoutRate: z.number()
    .positive('Payout rate must be greater than 0')
    .max(100000, 'Payout rate cannot exceed $100,000')
    .finite('Payout rate must be a valid number')
    .optional()
    .nullable(),
  
  maxPayout: z.number()
    .positive('Max payout must be greater than 0')
    .max(1000000, 'Max payout cannot exceed $1,000,000')
    .finite('Max payout must be a valid number')
    .optional()
    .nullable(),
  
  vipBonus: z.number()
    .nonnegative('VIP bonus cannot be negative')
    .max(100000, 'VIP bonus cannot exceed $100,000')
    .finite('VIP bonus must be a valid number')
    .optional()
    .nullable(),
  
  vipMaxPayout: z.number()
    .positive('VIP max payout must be greater than 0')
    .max(1000000, 'VIP max payout cannot exceed $1,000,000')
    .finite('VIP max payout must be a valid number')
    .optional()
    .nullable(),
  
  hybridRewardDescription: z.string()
    .trim()
    .max(1000, 'Hybrid reward description must be less than 1000 characters')
    .optional()
    .nullable(),
  
  fixedRateDescription: z.string()
    .trim()
    .max(1000, 'Fixed rate description must be less than 1000 characters')
    .optional()
    .nullable(),
  
  songLink: z.string()
    .trim()
    .url('Must be a valid URL')
    .max(500, 'URL too long')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  instructions: z.string()
    .trim()
    .max(5000, 'Instructions must be less than 5000 characters')
    .optional()
    .nullable(),
  
  rules: z.string()
    .trim()
    .max(5000, 'Rules must be less than 5000 characters')
    .optional()
    .nullable(),
  
  referenceLinks: z.string()
    .trim()
    .max(2000, 'Reference links must be less than 2000 characters')
    .optional()
    .nullable(),
  
  approvalRequired: z.boolean(),
  
  endDate: z.date()
    .min(new Date(), 'End date must be in the future')
    .optional()
    .nullable()
}).refine((data) => {
  // visual_services_offering doesn't require payout type
  if (data.campaignType === 'visual_services_offering') {
    return true;
  }
  
  // For other campaign types, validate payout requirements
  if (!data.payoutType) {
    return false;
  }
  
  // For performance_based, require payoutRate
  if (data.payoutType === 'performance_based') {
    return data.payoutRate != null && data.payoutRate > 0;
  }
  // For hybrid, require description
  if (data.payoutType === 'hybrid') {
    return data.hybridRewardDescription && data.hybridRewardDescription.trim().length > 0;
  }
  // For fixed_rate, require description
  if (data.payoutType === 'fixed_rate') {
    return data.fixedRateDescription && data.fixedRateDescription.trim().length > 0;
  }
  return true;
}, {
  message: 'Please provide the required reward information for the selected reward type',
  path: ['payoutRate']
});

export type CampaignInput = z.infer<typeof campaignSchema>;

// Profile Update Validation
export const profileUpdateSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  display_name: z.string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .optional()
    .nullable(),
  
  bio: z.string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  
  location: z.string()
    .trim()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .nullable()
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
