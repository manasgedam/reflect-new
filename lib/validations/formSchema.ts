import { z } from "zod"

// Option schema for multiple choice questions
export const OptionSchema = z.string().min(1, {
  message: "Option cannot be empty",
})

// Base question schema with common fields
const BaseQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, {
    message: "Question text is required",
  }),
  required: z.boolean().default(false),
  image: z.string().optional(),
})

// Multiple choice question schema
const MCQQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z
    .array(OptionSchema)
    .min(1, {
      message: "At least one option is required",
    })
    .max(4),
})

// Text question schema
const TextQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("text"),
})

// Video question schema
const VideoQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("video"),
})

// Sentiment question schema
const SentimentQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("sentiment"),
})

// Union of all question types
export const QuestionSchema = z.discriminatedUnion("type", [
  MCQQuestionSchema,
  TextQuestionSchema,
  VideoQuestionSchema,
  SentimentQuestionSchema,
])

// Form schema
export const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Form title is required",
  }),
  description: z.string().optional(),
  image: z.string().optional(),
  questions: z.array(QuestionSchema).min(1, {
    message: "At least one question is required",
  }),
})

// Form submission schema for API
export const FormSubmissionSchema = FormSchema.extend({
  userId: z.string().optional(),
})

// Response types
export type Question = z.infer<typeof QuestionSchema>
export type FormData = z.infer<typeof FormSchema>
export type FormSubmission = z.infer<typeof FormSubmissionSchema>

