import { z } from 'zod';

/**
 * Zod validation schemas for forms and API requests
 * Use these to validate user input before submission
 */

// Auth Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .min(1, 'Password is required')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const otpSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z
    .string()
    .min(4, 'Code must be at least 4 characters')
    .max(10, 'Code must be less than 10 characters')
});

// Profile Schemas
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  title: z
    .string()
    .max(100, 'Title is too long'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters'),
  city: z
    .string()
    .max(100, 'City is too long'),
  skills: z
    .array(z.string())
    .max(20, 'You can add up to 20 skills'),
  interests: z
    .array(z.string())
    .max(20, 'You can add up to 20 interests'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid Twitter URL').optional().or(z.literal(''))
});

// Post Schemas
export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(5000, 'Post must be less than 5000 characters'),
  circleId: z
    .enum(['learn', 'connect', 'earn', 'thrive', 'general'])
    .optional(),
  attachments: z
    .array(z.object({
      type: z.enum(['image', 'video', 'link']),
      url: z.string().url(),
      caption: z.string().optional()
    }))
    .max(5, 'Maximum 5 attachments allowed')
    .optional()
});

// Event Schemas
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title is too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long'),
  date: z
    .string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), 'Event date must be in the future'),
  location: z
    .string()
    .max(200, 'Location is too long'),
  maxAttendees: z
    .number()
    .min(1, 'At least 1 attendee allowed')
    .max(10000, 'Maximum 10000 attendees'),
  category: z
    .enum(['workshop', 'networking', 'social', 'educational', 'other'])
});

// Message Schemas
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
  recipientId: z.string().min(1, 'Recipient is required')
});

// Mentorship Request Schema
export const mentorshipRequestSchema = z.object({
  mentorId: z.string().min(1, 'Mentor is required'),
  goal: z
    .string()
    .min(10, 'Goal must be at least 10 characters')
    .max(500, 'Goal is too long'),
  duration: z
    .enum(['1-month', '3-months', '6-months', '12-months'])
    .default('3-months'),
  focusAreas: z
    .array(z.string())
    .min(1, 'Select at least one focus area')
    .max(5, 'Select up to 5 focus areas')
});

// Circle Request Schema
export const circleRequestSchema = z.object({
  name: z
    .string()
    .min(3, 'Circle name must be at least 3 characters')
    .max(100, 'Circle name is too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description is too long'),
  category: z
    .enum(['learn', 'connect', 'earn', 'thrive', 'custom']),
  isPrivate: z.boolean().default(false)
});

// Challenge Participation Schema
export const challengeParticipationSchema = z.object({
  challengeId: z.string().min(1, 'Challenge is required'),
  proof: z
    .string()
    .min(10, 'Proof must be at least 10 characters')
    .max(2000, 'Proof is too long'),
  mediaUrl: z.string().url('Invalid media URL').optional().or(z.literal(''))
});

// Donation Schema
export const donationSchema = z.object({
  amount: z
    .number()
    .min(1, 'Donation amount must be at least $1')
    .max(10000, 'Donation amount cannot exceed $10,000'),
  message: z
    .string()
    .max(500, 'Message is too long')
    .optional(),
  isAnonymous: z.boolean().default(false)
});

// Export types from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type MentorshipRequestInput = z.infer<typeof mentorshipRequestSchema>;
export type CircleRequestInput = z.infer<typeof circleRequestSchema>;
export type ChallengeParticipationInput = z.infer<typeof challengeParticipationSchema>;
export type DonationInput = z.infer<typeof donationSchema>;

/**
 * Utility function to validate data against a schema
 * Returns { valid: true, data } or { valid: false, errors }
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { valid: true; data: T } | { valid: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { valid: false, errors };
}
