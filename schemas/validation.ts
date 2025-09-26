import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Please enter a valid email address')
const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be at most 15 digits')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')

// Date validation helpers
const dateStringSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
)

const futureDateSchema = z.string().refine(
  (date) => new Date(date) > new Date(),
  'Date must be in the future'
)

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be at most 50 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be at most 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
})

// Booking schemas
export const bookingSchema = z.object({
  name: z.string().min(2, 'Booking name must be at least 2 characters').max(100, 'Booking name must be at most 100 characters'),
  agent_id: z.string().min(1, 'Agent is required'),
  date_from: dateStringSchema,
  date_to: dateStringSchema,
  pax: z.number().min(1, 'Number of passengers must be at least 1').max(100, 'Number of passengers cannot exceed 100'),
  rate_basis: z.enum(['Adult', 'Child', 'Family'], {
    message: 'Rate basis must be Adult, Child, or Family'
  }),
  consultant: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
  created_by: z.string().optional()
}).refine((data) => new Date(data.date_to) > new Date(data.date_from), {
  message: 'End date must be after start date',
  path: ['date_to']
}).refine((data) => new Date(data.date_from) >= new Date(new Date().toISOString().split('T')[0]), {
  message: 'Start date cannot be in the past',
  path: ['date_from']
})

export const bookingUpdateSchema = bookingSchema.partial().extend({
  id: z.string().min(1, 'Booking ID is required')
})

// Agent schemas
export const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters').max(100, 'Agent name must be at most 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be at most 100 characters'),
  commission_rate: z.number().min(0, 'Commission rate cannot be negative').max(100, 'Commission rate cannot exceed 100%'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
})

export const agentUpdateSchema = agentSchema.partial().extend({
  id: z.string().min(1, 'Agent ID is required')
})

// Document schemas
export const documentUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  category: z.enum(['Voucher', 'Air Ticket', 'Invoice', 'Other'], {
    message: 'Please select a valid document category'
  })
}).refine((data) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  return allowedTypes.includes(data.file.type)
}, {
  message: 'File type must be PDF, JPG, PNG, or DOCX',
  path: ['file']
}).refine((data) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return data.file.size <= maxSize
}, {
  message: 'File size must be less than 10MB',
  path: ['file']
})

// Filter schemas
export const bookingFilterSchema = z.object({
  search: z.string().optional(),
  agent_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  rate_basis: z.enum(['Adult', 'Child', 'Family']).optional(),
  consultant: z.string().optional(),
  created_by: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

export const agentFilterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

// User profile update schema
export const profileUpdateSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be at most 50 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be at most 50 characters'),
  email: emailSchema
})

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "New passwords don't match",
  path: ["confirm_password"]
})

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
export type AgentFormData = z.infer<typeof agentSchema>
export type DocumentUploadData = z.infer<typeof documentUploadSchema>
export type BookingFilterData = z.infer<typeof bookingFilterSchema>
export type AgentFilterData = z.infer<typeof agentFilterSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>

// Validation helper functions
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

export function validateField<T>(schema: z.ZodSchema<T>, fieldName: string, value: unknown): string | null {
  try {
    const fieldSchema = (schema as any).shape?.[fieldName] || schema
    fieldSchema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid value'
    }
    return 'Validation error'
  }
}