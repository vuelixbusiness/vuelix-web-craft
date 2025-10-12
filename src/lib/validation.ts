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
  
  campaignType: z.enum(['promotion', 'engagement', 'viral'], {
    errorMap: () => ({ message: 'Please select a valid campaign type' })
  }),
  
  platforms: z.array(z.string())
    .min(1, 'Select at least one platform')
    .max(10, 'Maximum 10 platforms allowed'),
  
  payoutType: z.enum(['per_view', 'per_like', 'flat_rate'], {
    errorMap: () => ({ message: 'Please select a valid payout type' })
  }),
  
  budget: z.number()
    .positive('Budget must be greater than 0')
    .max(10000000, 'Budget cannot exceed $10,000,000')
    .finite('Budget must be a valid number'),
  
  payoutRate: z.number()
    .positive('Payout rate must be greater than 0')
    .max(100000, 'Payout rate cannot exceed $100,000')
    .finite('Payout rate must be a valid number'),
  
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
});

export type CampaignInput = z.infer<typeof campaignSchema>;

// Profile Update Validation
export const profileUpdateSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
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
